<?php

namespace App\Http\Controllers;

use App\Models\Topic;
use App\Models\Subject;
use App\Models\Course;
use App\Models\CourseCollege;
use Illuminate\Http\Request;

class TopicController extends Controller
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

        return view('pages.manage-topics', compact('courses') + ['pageTitle' => 'Manage Topics']);
    }

    public function list(Request $request)
    {
        $topics = Topic::with('creator')
            ->where('subjectId', $request->subjectId)
            ->orderBy('createdAt')
            ->get();
        return response()->json(['status' => 200, 'message' => 'OK', 'data' => $topics]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subjectId' => 'required|integer',
            'title' => 'required|string',
        ]);

        Topic::create([
            'subjectId' => $request->subjectId,
            'title' => $request->title,
            'description' => $request->description,
            'createdBy' => auth()->id(),
        ]);

        return response()->json(['status' => 200, 'message' => 'Topic added']);
    }

    public function update(Request $request)
    {
        Topic::where('id', $request->id)->update([
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->input('status', 'active'),
        ]);
        return response()->json(['status' => 200, 'message' => 'Topic updated']);
    }

    public function destroy(Request $request)
    {
        Topic::destroy($request->id);
        return response()->json(['status' => 200, 'message' => 'Topic deleted']);
    }

    public function markComplete(Request $request)
    {
        $user = auth()->user();
        $courseId = $request->courseId;
        $topicId = $request->topicId;

        $enrollment = \App\Models\Enrollment::where('courseId', $courseId)
            ->where('studentId', $user->id)
            ->firstOrFail();

        $completed = $enrollment->completed_topics ?? [];
        if (!in_array($topicId, $completed)) {
            $completed[] = $topicId;
            $totalTopics = Topic::whereHas('subject', fn($q) => $q->where('courseId', $courseId))
                ->where('status', 'active')
                ->count();

            $progress = $totalTopics > 0 ? min(round((count($completed) / $totalTopics) * 100), 100) : 0;
            $status = ($progress == 100) ? 'completed' : 'active';

            $enrollment->update([
                'completed_topics' => $completed,
                'progress' => $progress,
                'status' => $status,
                'completedAt' => $progress == 100 ? now() : null,
            ]);
        }

        return response()->json(['status' => 200, 'message' => 'Marked complete', 'progress' => $enrollment->progress]);
    }
}
