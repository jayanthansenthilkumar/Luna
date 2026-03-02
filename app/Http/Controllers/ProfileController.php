<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ProfileRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $u = User::with('college')->findOrFail($user->id);

        $pct = $u->profile_completion;
        $pctColor = ($pct >= 100) ? 'bg-success' : 'bg-warning';

        $isAdmin = in_array($u->role, ['superAdmin', 'adminAzhagii']);
        $isLocked = ($u->isLocked && !$isAdmin);

        $avatarHtml = '';
        if (!empty($u->profilePhoto)) {
            $avatarHtml = '<img src="' . asset($u->profilePhoto) . '" alt="Avatar">';
        } else {
            $avatarHtml = strtoupper(substr($u->name, 0, 1));
        }
        if (!$isLocked) {
            $avatarHtml .= '<div class="upload-overlay">Change</div>';
        }

        return view('pages.profile', compact('u', 'pct', 'pctColor', 'isAdmin', 'isLocked', 'avatarHtml') + ['pageTitle' => 'My Profile']);
    }

    public function getMyProfile()
    {
        $user = auth()->user();
        $u = User::with('college')->findOrFail($user->id);
        $u->makeHidden('password');
        $u->profile_completion_value = $u->profile_completion;

        // Auto-lock
        if ($u->profile_completion == 100 && !$u->isLocked) {
            $u->isLocked = true;
            $u->save();
        }

        // Check pending unlock
        $pending = ProfileRequest::where('userId', $user->id)
            ->where('status', 'pending')
            ->latest('createdAt')
            ->first();
        if ($pending) {
            $u->unlock_request = $pending;
        }

        return response()->json(['status' => 200, 'message' => 'OK', 'data' => $u]);
    }

    public function updateMyProfile(Request $request)
    {
        $user = auth()->user();
        $u = User::findOrFail($user->id);

        if ($u->isLocked && !in_array($u->role, ['superAdmin', 'adminAzhagii'])) {
            return response()->json(['status' => 403, 'message' => 'Profile is locked. Request unlock from admin.'], 403);
        }

        $data = [
            'name' => $request->name,
            'phone' => $request->phone,
            'bio' => $request->bio,
            'gender' => $request->gender,
            'dob' => $request->dob ?: null,
            'address' => $request->address,
            'githubUrl' => $request->githubUrl,
            'linkedinUrl' => $request->linkedinUrl,
            'hackerrankUrl' => $request->hackerrankUrl,
            'leetcodeUrl' => $request->leetcodeUrl,
        ];

        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }

        if ($request->hasFile('profilePhoto')) {
            $file = $request->file('profilePhoto');
            $ext = $file->getClientOriginalExtension();
            $userRoll = $u->rollNumber ?? $u->id;
            $fname = $userRoll . '.' . $ext;
            $file->move(public_path('uploads/profiles'), $fname);
            $data['profilePhoto'] = 'uploads/profiles/' . $fname;
        }

        $u->update($data);

        // Auto-lock profile when completion reaches 100%
        $u->refresh();
        if ($u->profile_completion == 100 && !$u->isLocked && !in_array($u->role, ['superAdmin', 'adminAzhagii'])) {
            $u->update(['isLocked' => true]);
        }

        return response()->json(['status' => 200, 'message' => 'Profile updated successfully']);
    }

    public function updatePhoto(Request $request)
    {
        $user = auth()->user();
        $u = User::findOrFail($user->id);

        if (!$request->hasFile('profilePhoto')) {
            return response()->json(['status' => 400, 'message' => 'No photo uploaded'], 400);
        }

        $file = $request->file('profilePhoto');
        $ext = $file->getClientOriginalExtension();
        $userRoll = $u->rollNumber ?? $u->id;
        $fname = $userRoll . '.' . $ext;
        $file->move(public_path('uploads/profiles'), $fname);
        $path = 'uploads/profiles/' . $fname;

        $u->update(['profilePhoto' => $path]);

        return response()->json(['status' => 200, 'message' => 'Photo updated successfully']);
    }

    public function requestUnlock(Request $request)
    {
        $user = auth()->user();

        if (!$request->reason) {
            return response()->json(['status' => 400, 'message' => 'Reason is required'], 400);
        }

        if (ProfileRequest::where('userId', $user->id)->where('status', 'pending')->exists()) {
            return response()->json(['status' => 400, 'message' => 'Request already pending'], 400);
        }

        ProfileRequest::create([
            'userId' => $user->id,
            'requestReason' => $request->reason,
        ]);

        return response()->json(['status' => 200, 'message' => 'Unlock request sent to admin']);
    }

    // Profile Requests page (admin)
    public function requestsPage()
    {
        $requests = ProfileRequest::with(['user', 'user.college'])
            ->where('status', 'pending')
            ->orderBy('createdAt', 'desc')
            ->get();
        return view('pages.profile-requests', compact('requests') + ['pageTitle' => 'Profile Requests']);
    }

    public function resolveRequest(Request $request)
    {
        $action = $request->action;
        if (!in_array($action, ['approve', 'reject'])) {
            return response()->json(['status' => 400, 'message' => 'Invalid action'], 400);
        }

        $status = ($action === 'approve') ? 'approved' : 'rejected';

        DB::transaction(function () use ($request, $status, $action) {
            $pr = ProfileRequest::findOrFail($request->request_id);
            $pr->update([
                'status' => $status,
                'resolvedBy' => auth()->id(),
                'resolvedAt' => now(),
            ]);

            if ($action === 'approve') {
                User::where('id', $pr->userId)->update(['isLocked' => false]);
            }
        });

        return response()->json(['status' => 200, 'message' => 'Request ' . $status]);
    }

    public function listRequests()
    {
        $requests = ProfileRequest::with(['user', 'user.college'])
            ->where('status', 'pending')
            ->orderBy('createdAt', 'desc')
            ->get();
        return response()->json(['status' => 200, 'message' => 'OK', 'data' => $requests]);
    }
}
