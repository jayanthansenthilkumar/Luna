<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Course;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index()
    {
        $courses = Course::orderBy('title')->get(['id', 'title', 'courseCode']);
        $pageTitle = 'Manage Subjects';
        return view('pages.manage-subjects', compact('courses', 'pageTitle'));
    }

    public function list(Request $request)
    {
        $query = Subject::query();
        if ($request->courseId) {
            $query->where('courseId', $request->courseId);
        }
        $subjects = $query->orderBy('createdAt', 'desc')->get();
        return response()->json(['status' => 200, 'message' => 'OK', 'data' => $subjects]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'courseId' => 'required|integer',
            'title' => 'required|string',
        ]);

        $user = auth()->user();
        if ($user->hasRole('azhagiiCoordinator')) {
            $course = Course::findOrFail($request->courseId);
            if ($course->createdBy != $user->id) {
                return response()->json(['status' => 403, 'message' => 'Can only add subjects to your own courses'], 403);
            }
        }

        Subject::create($request->only(['courseId', 'title', 'code', 'description']));
        return response()->json(['status' => 200, 'message' => 'Subject added']);
    }

    public function update(Request $request)
    {
        Subject::where('id', $request->id)->update([
            'title' => $request->title,
            'code' => $request->code,
            'description' => $request->description,
            'status' => $request->input('status', 'active'),
        ]);
        return response()->json(['status' => 200, 'message' => 'Subject updated']);
    }

    public function destroy(Request $request)
    {
        Subject::destroy($request->id);
        return response()->json(['status' => 200, 'message' => 'Subject deleted']);
    }
}
