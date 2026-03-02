<?php

namespace App\Http\Controllers;

use App\Models\CourseCollege;
use App\Models\Course;
use App\Models\College;
use Illuminate\Http\Request;

class CourseAssignmentController extends Controller
{
    public function index()
    {
        $courses = Course::orderBy('title')->get(['id', 'title', 'courseCode']);
        $pageTitle = 'Course Assignments';
        return view('pages.course-assignments', compact('courses', 'pageTitle'));
    }

    public function list(Request $request)
    {
        $assignments = CourseCollege::with(['college', 'assignedByUser'])
            ->where('courseId', $request->courseId)
            ->orderBy('assignedAt', 'desc')
            ->get();
        return response()->json(['status' => 200, 'message' => 'OK', 'data' => $assignments]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'courseId' => 'required|integer',
            'collegeId' => 'required|integer',
        ]);

        if (CourseCollege::where('courseId', $request->courseId)->where('collegeId', $request->collegeId)->exists()) {
            return response()->json(['status' => 409, 'message' => 'Already assigned'], 409);
        }

        CourseCollege::create([
            'courseId' => $request->courseId,
            'collegeId' => $request->collegeId,
            'assignedBy' => auth()->id(),
        ]);

        return response()->json(['status' => 200, 'message' => 'Course assigned to college']);
    }

    public function destroy(Request $request)
    {
        CourseCollege::destroy($request->id);
        return response()->json(['status' => 200, 'message' => 'Assignment removed']);
    }

    public function unassign(Request $request)
    {
        CourseCollege::where('courseId', $request->courseId)
            ->where('collegeId', $request->collegeId)
            ->delete();
        return response()->json(['status' => 200, 'message' => 'Course unassigned']);
    }
}
