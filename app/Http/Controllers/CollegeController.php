<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\User;
use Illuminate\Http\Request;

class CollegeController extends Controller
{
    public function index()
    {
        $colleges = College::withCount('users')->orderBy('name')->get();
        $pageTitle = 'Manage Colleges';
        return view('pages.manage-colleges', compact('colleges', 'pageTitle'));
    }

    // API Methods
    public function list()
    {
        $colleges = College::withCount('users')->orderBy('name')->get();
        return response()->json(['status' => 200, 'message' => 'OK', 'data' => $colleges]);
    }

    public function listPublic()
    {
        $colleges = College::where('status', 'active')
            ->select('id', 'name', 'code', 'city')
            ->orderBy('name')
            ->get();
        return response()->json(['status' => 200, 'message' => 'OK', 'data' => $colleges]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:colleges,code',
        ]);

        College::create($request->only(['name', 'code', 'address', 'city']));

        return response()->json(['status' => 200, 'message' => 'College added']);
    }

    public function update(Request $request)
    {
        $id = $request->input('id');

        if (College::where('code', $request->code)->where('id', '!=', $id)->exists()) {
            return response()->json(['status' => 409, 'message' => 'College code already exists'], 409);
        }

        College::where('id', $id)->update([
            'name' => $request->name,
            'code' => $request->code,
            'address' => $request->address,
            'city' => $request->city,
            'status' => $request->input('status', 'active'),
        ]);

        return response()->json(['status' => 200, 'message' => 'College updated']);
    }

    public function destroy(Request $request)
    {
        College::destroy($request->input('id'));
        return response()->json(['status' => 200, 'message' => 'College deleted']);
    }
}
