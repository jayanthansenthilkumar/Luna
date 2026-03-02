<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\CourseCollege;
use App\Models\Course;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function myLearning()
    {
        $user = auth()->user();
        $myCourses = Enrollment::with(['course' => function ($q) {
            $q->withCount(['contents' => fn($q2) => $q2->where('status', 'active')]);
        }])
            ->where('studentId', $user->id)
            ->orderBy('enrolledAt', 'desc')
            ->get();

        return view('pages.my-learning', compact('myCourses') + ['pageTitle' => 'My Learning']);
    }

    public function courseViewer(Request $request)
    {
        $courseId = $request->query('courseId');
        $user = auth()->user();

        if (!$courseId) {
            return redirect()->route('my-learning');
        }

        $course = Course::select('courses.*')
            ->join('enrollments', 'courses.id', '=', 'enrollments.courseId')
            ->where('courses.id', $courseId)
            ->where('enrollments.studentId', $user->id)
            ->first();

        if (!$course) {
            return redirect()->route('my-learning')->with('error', 'Course not found or you are not enrolled.');
        }

        $enrollment = Enrollment::where('courseId', $courseId)
            ->where('studentId', $user->id)
            ->first();

        $completedTopics = $enrollment->completed_topics ?? [];

        $subjects = \App\Models\Subject::where('courseId', $courseId)
            ->orderBy('id')
            ->get();

        $firstTopic = null;
        foreach ($subjects as $subject) {
            $subject->topicsList = \App\Models\Topic::where('subjectId', $subject->id)
                ->where('status', 'active')
                ->orderBy('id')
                ->get();
            if (!$firstTopic && $subject->topicsList->count() > 0) {
                $firstTopic = $subject->topicsList->first();
            }
        }

        return view('pages.course-viewer', compact('course', 'enrollment', 'completedTopics', 'subjects', 'firstTopic') + ['pageTitle' => $course->title]);
    }

    public function enroll(Request $request)
    {
        $user = auth()->user();
        $courseId = $request->courseId;

        // Check college assignment
        if (!CourseCollege::where('courseId', $courseId)->where('collegeId', $user->collegeId)->exists()) {
            return response()->json(['status' => 403, 'message' => 'Course not available for your college'], 403);
        }

        if (Enrollment::where('studentId', $user->id)->where('courseId', $courseId)->exists()) {
            return response()->json(['status' => 409, 'message' => 'Already enrolled'], 409);
        }

        Enrollment::create([
            'studentId' => $user->id,
            'courseId' => $courseId,
            'progress' => 0,
            'status' => 'active',
        ]);

        return response()->json(['status' => 200, 'message' => 'Enrolled successfully']);
    }

    public function unenroll(Request $request)
    {
        $user = auth()->user();
        $query = Enrollment::where('id', $request->id);
        if ($user->hasRole('azhagiiStudents')) {
            $query->where('studentId', $user->id);
        }
        $query->delete();
        return response()->json(['status' => 200, 'message' => 'Unenrolled']);
    }

    public function list(Request $request)
    {
        $user = auth()->user();
        $query = Enrollment::with(['student', 'student.college', 'course']);

        if ($request->courseId) {
            $query->where('courseId', $request->courseId);
        }
        if ($user->hasRole('azhagiiStudents')) {
            $query->where('studentId', $user->id);
        }
        if ($user->hasRole('azhagiiCoordinator')) {
            $query->whereHas('student', fn($q) => $q->where('collegeId', $user->collegeId));
            $query->whereIn('courseId', CourseCollege::where('collegeId', $user->collegeId)->pluck('courseId'));
        }

        return response()->json(['status' => 200, 'message' => 'OK', 'data' => $query->orderBy('enrolledAt', 'desc')->get()]);
    }

    public function updateProgress(Request $request)
    {
        $user = auth()->user();
        $enrollment = Enrollment::where('id', $request->id)
            ->where('studentId', $user->id)
            ->firstOrFail();

        $data = ['progress' => $request->progress];
        if ($request->progress >= 100) {
            $data['status'] = 'completed';
            $data['completedAt'] = now();
        }

        $enrollment->update($data);
        return response()->json(['status' => 200, 'message' => 'Progress updated']);
    }

    public function courseStudents(Request $request)
    {
        $user = auth()->user();
        $query = Enrollment::with(['student', 'student.college'])
            ->where('courseId', $request->courseId);

        if ($user->hasRole('azhagiiCoordinator')) {
            $query->whereHas('student', fn($q) => $q->where('collegeId', $user->collegeId));
        }

        return response()->json(['status' => 200, 'message' => 'OK', 'data' => $query->orderBy('enrolledAt', 'desc')->get()]);
    }

    // My Students page (coordinator)
    public function myStudents()
    {
        $user = auth()->user();
        $courses = Course::where(function ($q) use ($user) {
            $q->whereIn('id', CourseCollege::where('collegeId', $user->collegeId)->pluck('courseId'))
                ->orWhere('createdBy', $user->id);
        })->orderBy('title')->get(['id', 'title', 'courseCode']);

        return view('pages.my-students', compact('courses') + ['pageTitle' => 'My Students']);
    }
}
