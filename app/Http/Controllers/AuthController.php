<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }
        return view('auth.login', ['pageTitle' => 'Login']);
    }

    public function login(Request $request)
    {
        $username = $request->input('username');
        $password = $request->input('password');

        $user = User::with('college')
            ->where('username', $username)
            ->where('status', 'active')
            ->first();

        if ($user) {
            $loginSuccess = false;

            if (Hash::check($password, $user->password)) {
                $loginSuccess = true;
            } elseif ($password === $user->getRawOriginal('password')) {
                // Fallback: plain text password migration
                $loginSuccess = true;
                $user->password = $password; // Will be auto-hashed by cast
                $user->save();
            }

            if ($loginSuccess) {
                Auth::login($user);
                return response()->json([
                    'status' => 200,
                    'message' => 'Login successful',
                    'data' => ['role' => $user->role, 'name' => $user->name],
                ]);
            }
        }

        return response()->json(['status' => 401, 'message' => 'Invalid username or password'], 401);
    }

    public function showRegister()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }
        $colleges = College::where('status', 'active')->orderBy('name')->get();
        return view('auth.register', compact('colleges') + ['pageTitle' => 'Register']);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'username' => 'required|string|min:4|regex:/^[a-zA-Z0-9_]+$/|unique:users,username',
            'password' => 'required|string|min:6',
            'collegeId' => 'required|exists:colleges,id',
            'department' => 'required|string',
            'year' => 'required|string',
            'rollNumber' => 'required|string|size:12|unique:users,rollNumber',
            'phone' => 'required|string',
        ]);

        // Generate azhagiiID
        $college = College::findOrFail($request->collegeId);
        $collegeCode = strtoupper($college->code);
        $count = User::where('role', 'azhagiiStudents')
            ->where('collegeId', $request->collegeId)
            ->count();
        $azhagiiID = 'AZG' . $collegeCode . str_pad($count + 1, 4, '0', STR_PAD_LEFT);

        // Handle profile photo
        $photoPath = null;
        if ($request->hasFile('profilePhoto')) {
            $file = $request->file('profilePhoto');
            $ext = $file->getClientOriginalExtension();
            $fname = $request->rollNumber . '.' . $ext;
            $file->move(public_path('uploads/profiles'), $fname);
            $photoPath = 'uploads/profiles/' . $fname;
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => $request->password,
            'role' => 'azhagiiStudents',
            'collegeId' => $request->collegeId,
            'department' => $request->department,
            'year' => $request->year,
            'rollNumber' => $request->rollNumber,
            'azhagiiID' => $azhagiiID,
            'phone' => $request->phone,
            'gender' => $request->input('gender'),
            'dob' => $request->input('dob') ?: null,
            'address' => $request->input('address'),
            'bio' => $request->input('bio'),
            'githubUrl' => $request->input('githubUrl'),
            'linkedinUrl' => $request->input('linkedinUrl'),
            'hackerrankUrl' => $request->input('hackerrankUrl'),
            'leetcodeUrl' => $request->input('leetcodeUrl'),
            'profilePhoto' => $photoPath,
        ]);

        Auth::login($user);

        return response()->json(['status' => 200, 'message' => 'Registration successful!']);
    }

    public function logout()
    {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect()->route('home');
    }

    public function checkSession()
    {
        if (Auth::check()) {
            $user = Auth::user();
            return response()->json([
                'status' => 200,
                'message' => 'Active',
                'data' => [
                    'userId' => $user->id,
                    'user_name' => $user->name,
                    'user_email' => $user->email,
                    'role' => $user->role,
                    'collegeId' => $user->collegeId,
                    'college_name' => $user->college->name ?? '',
                ],
            ]);
        }
        return response()->json(['status' => 401, 'message' => 'No session'], 401);
    }
}
