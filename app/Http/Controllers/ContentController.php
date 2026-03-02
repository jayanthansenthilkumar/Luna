<?php

namespace App\Http\Controllers;

use App\Models\CourseContent;
use App\Models\Course;
use App\Models\CourseCollege;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->hasRole('superAdmin')) {
            $courses = Course::orderBy('title')->get(['id', 'title', 'courseCode']);
        } else {
            $courses = Course::where(function ($q) use ($user) {
                $q->whereIn('id', CourseCollege::where('collegeId', $user->collegeId)->pluck('courseId'))
                    ->orWhere('createdBy', $user->id);
            })->orderBy('title')->get(['id', 'title', 'courseCode']);
        }

        return view('pages.manage-content', compact('courses') + ['pageTitle' => 'Manage Content']);
    }

    public function list(Request $request)
    {
        $user = auth()->user();
        $query = CourseContent::with(['uploader', 'college', 'subject'])
            ->where('courseId', $request->courseId);

        if ($user->hasRole('azhagiiCoordinator')) {
            $query->where(function ($q) use ($user) {
                $q->where('collegeId', $user->collegeId)->orWhere('collegeId', 0)->orWhereNull('collegeId');
            });
        }
        if ($user->hasRole('azhagiiStudents')) {
            $query->where(function ($q) use ($user) {
                $q->where('collegeId', $user->collegeId)->orWhere('collegeId', 0)->orWhereNull('collegeId');
            })->where('status', 'active');
        }

        $data = $query->orderBy('sortOrder')->orderBy('createdAt')->get();
        return response()->json(['status' => 200, 'message' => 'OK', 'data' => $data]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'courseId' => 'required|integer',
            'title' => 'required|string',
        ]);

        $user = auth()->user();
        $dataVal = $request->input('contentData', '');

        // Handle file upload for PDF type
        if ($request->input('contentType') === 'pdf' && $request->hasFile('content_file')) {
            $file = $request->file('content_file');
            $fname = 'content_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/content'), $fname);
            $dataVal = 'uploads/content/' . $fname;
        }

        CourseContent::create([
            'courseId' => $request->courseId,
            'subjectId' => $request->subjectId ?: null,
            'title' => $request->title,
            'description' => $request->description,
            'contentType' => $request->input('contentType', 'text'),
            'contentData' => $dataVal,
            'uploadedBy' => $user->id,
            'collegeId' => $user->hasRole('azhagiiCoordinator') ? $user->collegeId : ($request->collegeId ?: null),
            'sortOrder' => $request->input('sortOrder', 0),
        ]);

        return response()->json(['status' => 200, 'message' => 'Content added']);
    }

    public function update(Request $request)
    {
        $user = auth()->user();
        $dataVal = $request->input('contentData', '');

        if ($request->input('contentType') === 'pdf' && $request->hasFile('content_file')) {
            $file = $request->file('content_file');
            $fname = 'content_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/content'), $fname);
            $dataVal = 'uploads/content/' . $fname;
        }

        $query = CourseContent::where('id', $request->id);
        if ($user->hasRole('azhagiiCoordinator')) {
            $query->where('uploadedBy', $user->id);
        }

        $query->update([
            'title' => $request->title,
            'description' => $request->description,
            'contentType' => $request->input('contentType', 'text'),
            'contentData' => $dataVal,
            'sortOrder' => $request->input('sortOrder', 0),
            'status' => $request->input('status', 'active'),
            'subjectId' => $request->subjectId ?: null,
        ]);

        return response()->json(['status' => 200, 'message' => 'Content updated']);
    }

    public function destroy(Request $request)
    {
        $user = auth()->user();
        $query = CourseContent::where('id', $request->id);
        if ($user->hasRole('azhagiiCoordinator')) {
            $query->where('uploadedBy', $user->id);
        }
        $query->delete();
        return response()->json(['status' => 200, 'message' => 'Content deleted']);
    }
}
