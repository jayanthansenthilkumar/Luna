<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\College;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $colleges = College::orderBy('name')->get(['id', 'name']);
        $user = auth()->user();

        $query = User::with('college');
        if ($user->role === 'adminAzhagii') {
            $query->where('role', '!=', 'superAdmin');
        }
        $users = $query->orderBy('createdAt', 'desc')->get();

        $pageTitle = 'Manage Users';
        return view('pages.manage-users', compact('colleges', 'users', 'pageTitle'));
    }

    public function list(Request $request)
    {
        $query = User::with('college');

        if ($request->input('role_filter')) {
            $query->where('role', $request->role_filter);
        }
        if ($request->input('college_filter')) {
            $query->where('collegeId', $request->college_filter);
        }
        if (auth()->user()->role === 'adminAzhagii') {
            $query->where('role', '!=', 'superAdmin');
        }

        $users = $query->orderBy('createdAt', 'desc')->get()->makeVisible([]);
        $users->each(fn($u) => $u->makeHidden('password'));

        return response()->json(['status' => 200, 'message' => 'OK', 'data' => $users]);
    }

    public function detail(Request $request)
    {
        $user = User::with('college')->findOrFail($request->userId);
        $user->makeHidden('password');
        return response()->json(['status' => 200, 'message' => 'OK', 'data' => $user]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'username' => 'required|string|unique:users,username',
            'password' => 'required|string',
            'role' => 'required|string',
        ]);

        $authUser = auth()->user();
        if ($authUser->role === 'adminAzhagii' && in_array($request->role, ['superAdmin', 'adminAzhagii'])) {
            return response()->json(['status' => 403, 'message' => 'Cannot create this role'], 403);
        }

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => $request->password,
            'role' => $request->role,
            'collegeId' => $request->collegeId ?: null,
            'phone' => $request->phone,
        ]);

        return response()->json(['status' => 200, 'message' => 'User added']);
    }

    public function update(Request $request)
    {
        $id = $request->input('id');
        $authUser = auth()->user();
        $target = User::findOrFail($id);

        if ($authUser->role === 'adminAzhagii' && $target->role === 'superAdmin') {
            return response()->json(['status' => 403, 'message' => 'Cannot edit this user'], 403);
        }
        if ($authUser->role === 'adminAzhagii' && in_array($request->role, ['superAdmin', 'adminAzhagii'])) {
            return response()->json(['status' => 403, 'message' => 'Cannot assign this role'], 403);
        }

        if (User::where('email', $request->email)->where('id', '!=', $id)->exists()) {
            return response()->json(['status' => 409, 'message' => 'Email already exists'], 409);
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'collegeId' => $request->collegeId ?: null,
            'status' => $request->input('status', 'active'),
        ];

        // Only update optional fields if they are explicitly present in the request
        $optionalFields = ['phone', 'bio', 'address', 'gender', 'department', 'year', 'rollNumber'];
        foreach ($optionalFields as $field) {
            if ($request->has($field)) {
                $data[$field] = $request->$field;
            }
        }
        if ($request->has('dob')) {
            $data['dob'] = $request->dob ?: null;
        }

        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }

        $target->update($data);

        return response()->json(['status' => 200, 'message' => 'User updated']);
    }

    public function destroy(Request $request)
    {
        $id = $request->input('id');
        $authUser = auth()->user();

        if ($id == $authUser->id) {
            return response()->json(['status' => 400, 'message' => 'Cannot delete yourself'], 400);
        }

        $target = User::findOrFail($id);
        if ($authUser->role === 'adminAzhagii' && $target->role === 'superAdmin') {
            return response()->json(['status' => 403, 'message' => 'Cannot delete this user'], 403);
        }

        $target->delete();
        return response()->json(['status' => 200, 'message' => 'User deleted']);
    }

    // Azhagii Students page (superAdmin only)
    public function azhagiiStudents()
    {
        $colleges = College::orderBy('name')->get(['id', 'name']);
        $students = User::with('college')
            ->where('role', 'azhagiiStudents')
            ->orderBy('name')
            ->get();
        $pageTitle = 'Azhagii Students';
        return view('pages.azhagii-students', compact('colleges', 'students', 'pageTitle'));
    }
}
