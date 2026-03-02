<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseCollege;
use App\Models\Subject;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::with(['creator', 'approver'])
            ->withCount(['collegeAssignments', 'enrollments', 'contents', 'subjects'])
            ->orderBy('createdAt', 'desc')
            ->get();
        return view('pages.manage-courses', compact('courses') + ['pageTitle' => 'Manage Courses']);
    }

    public function list(Request $request)
    {
        $user = auth()->user();
        $query = Course::with(['creator', 'approver'])
            ->withCount(['collegeAssignments', 'enrollments', 'contents', 'subjects']);

        if ($user->hasRole('azhagiiCoordinator')) {
            $query->where(function ($q) use ($user) {
                $q->whereIn('id', CourseCollege::where('collegeId', $user->collegeId)->pluck('courseId'))
                    ->orWhere('createdBy', $user->id);
            });
        } elseif ($user->hasRole('azhagiiStudents')) {
            $query->where('status', 'active')
                ->whereIn('id', CourseCollege::where('collegeId', $user->collegeId)->pluck('courseId'));
        }

        if ($request->input('status_filter')) {
            $query->where('status', $request->status_filter);
        }

        return response()->json(['status' => 200, 'message' => 'OK', 'data' => $query->orderBy('createdAt', 'desc')->get()]);
    }

    public function detail(Request $request)
    {
        $course = Course::with(['creator', 'approver'])->findOrFail($request->courseId);
        $subjects = Subject::where('courseId', $course->id)
            ->withCount('topics')
            ->orderBy('createdAt')
            ->get();

        foreach ($subjects as $subject) {
            $subject->topics = $subject->topics()->orderBy('createdAt')->get();
        }

        $course->subjects = $subjects;
        return response()->json(['status' => 200, 'message' => 'OK', 'data' => $course]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $request->validate(['title' => 'required|string']);

        $status = $user->hasRole('azhagiiCoordinator') ? 'pending' : ($request->input('status', 'draft'));

        // Handle thumbnail
        $thumb = '';
        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $fname = 'thumb_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/thumbnails'), $fname);
            $thumb = 'uploads/thumbnails/' . $fname;
        }

        // Handle syllabus
        $syllabus = '';
        if ($request->hasFile('syllabus')) {
            $file = $request->file('syllabus');
            $fname = 'syllabus_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/content'), $fname);
            $syllabus = 'uploads/content/' . $fname;
        }

        $course = Course::create([
            'title' => $request->title,
            'courseCode' => $request->courseCode,
            'description' => $request->description,
            'category' => $request->category,
            'courseType' => $request->input('courseType', 'theory'),
            'thumbnail' => $thumb,
            'syllabus' => $syllabus,
            'semester' => $request->semester,
            'regulation' => $request->regulation,
            'academicYear' => $request->academicYear,
            'createdBy' => $user->id,
            'status' => $status,
        ]);

        // Add units/subjects
        for ($i = 1; $i <= 5; $i++) {
            if ($request->filled("unit_$i")) {
                Subject::create([
                    'courseId' => $course->id,
                    'title' => $request->input("unit_$i"),
                ]);
            }
        }

        // Auto-assign coordinator's college
        if ($user->hasRole('azhagiiCoordinator') && $user->collegeId) {
            CourseCollege::create([
                'courseId' => $course->id,
                'collegeId' => $user->collegeId,
                'assignedBy' => $user->id,
            ]);
        }

        return response()->json([
            'status' => 200,
            'message' => 'Course created' . ($user->hasRole('azhagiiCoordinator') ? ' and submitted for approval' : ''),
            'data' => ['id' => $course->id],
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();
        $course = Course::findOrFail($request->id);

        if ($user->hasRole('azhagiiCoordinator')) {
            if ($course->createdBy != $user->id) {
                return response()->json(['status' => 403, 'message' => 'Cannot edit this course'], 403);
            }
            if (!in_array($course->status, ['pending', 'rejected'])) {
                return response()->json(['status' => 403, 'message' => 'Can only edit pending or rejected courses'], 403);
            }
        }

        $data = [
            'title' => $request->title,
            'courseCode' => $request->courseCode,
            'description' => $request->description,
            'category' => $request->category,
            'courseType' => $request->input('courseType', 'theory'),
            'semester' => $request->semester,
            'regulation' => $request->regulation,
            'academicYear' => $request->academicYear,
            'status' => $user->hasRole('azhagiiCoordinator') ? 'pending' : ($request->input('status', 'draft')),
        ];

        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $fname = 'thumb_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/thumbnails'), $fname);
            $data['thumbnail'] = 'uploads/thumbnails/' . $fname;
        }

        if ($request->hasFile('syllabus')) {
            $file = $request->file('syllabus');
            $fname = 'syllabus_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/content'), $fname);
            $data['syllabus'] = 'uploads/content/' . $fname;
        }

        $course->update($data);
        return response()->json(['status' => 200, 'message' => 'Course updated']);
    }

    public function destroy(Request $request)
    {
        $user = auth()->user();
        $course = Course::findOrFail($request->id);

        if ($user->hasRole('azhagiiCoordinator')) {
            if ($course->createdBy != $user->id) {
                return response()->json(['status' => 403, 'message' => 'Cannot delete this course'], 403);
            }
            if (!in_array($course->status, ['pending', 'rejected'])) {
                return response()->json(['status' => 403, 'message' => 'Can only delete pending or rejected courses'], 403);
            }
        }

        $course->delete();
        return response()->json(['status' => 200, 'message' => 'Course deleted']);
    }

    // Course Approvals page
    public function approvalsPage()
    {
        $stats = [
            'pending' => Course::where('status', 'pending')->count(),
            'active' => Course::where('status', 'active')->count(),
            'rejected' => Course::where('status', 'rejected')->count(),
            'enrollments' => Enrollment::count(),
        ];
        $stats['courses'] = $stats['pending'] + $stats['active'] + $stats['rejected'];

        $pendingCourses = Course::with(['creator', 'creator.college'])
            ->withCount('subjects')
            ->where('status', 'pending')
            ->orderBy('createdAt', 'desc')
            ->get();

        return view('pages.course-approvals', compact('stats', 'pendingCourses') + ['pageTitle' => 'Course Approvals']);
    }

    public function approve(Request $request)
    {
        $course = Course::where('id', $request->id)->where('status', 'pending')->firstOrFail();
        $course->update([
            'status' => 'active',
            'approvedBy' => auth()->id(),
            'approvedAt' => now(),
            'rejectionReason' => null,
        ]);
        return response()->json(['status' => 200, 'message' => 'Course approved and published']);
    }

    public function reject(Request $request)
    {
        $course = Course::where('id', $request->id)->where('status', 'pending')->firstOrFail();
        $course->update([
            'status' => 'rejected',
            'approvedBy' => auth()->id(),
            'approvedAt' => now(),
            'rejectionReason' => $request->reason,
        ]);
        return response()->json(['status' => 200, 'message' => 'Course rejected']);
    }

    // My Courses page
    public function myCourses()
    {
        $user = auth()->user();

        if ($user->hasRole(['superAdmin', 'adminAzhagii'])) {
            $courses = Course::with('creator')
                ->withCount(['contents' => fn($q) => $q->where('status', 'active')])
                ->orderBy('createdAt', 'desc')
                ->get();
        } elseif ($user->hasRole('azhagiiCoordinator')) {
            $courses = Course::with('creator')
                ->withCount(['contents' => fn($q) => $q->where('status', 'active')])
                ->where(function ($q) use ($user) {
                    $q->whereIn('id', CourseCollege::where('collegeId', $user->collegeId)->pluck('courseId'))
                        ->orWhere('createdBy', $user->id);
                })
                ->orderBy('createdAt', 'desc')
                ->get();
        } else {
            $courses = Course::with('creator')
                ->withCount(['contents' => fn($q) => $q->where('status', 'active')])
                ->where('createdBy', $user->id)
                ->orderBy('createdAt', 'desc')
                ->get();
        }

        return view('pages.my-courses', compact('courses') + ['pageTitle' => 'My Courses']);
    }

    // Coordinator Course Create page
    public function createPage()
    {
        $user = auth()->user();
        $myCourses = Course::where('createdBy', $user->id)
            ->orderBy('createdAt', 'desc')
            ->get();
        return view('pages.coordinator-course-create', compact('myCourses') + ['pageTitle' => 'Create Course']);
    }

    // Browse Courses (Student)
    public function browse()
    {
        $user = auth()->user();
        $enrolledIds = Enrollment::where('studentId', $user->id)->pluck('courseId')->toArray();

        $courses = Course::where('status', 'active')
            ->whereIn('id', CourseCollege::where('collegeId', $user->collegeId)->pluck('courseId'))
            ->withCount(['contents' => fn($q) => $q->where('status', 'active')])
            ->orderBy('createdAt', 'desc')
            ->get();

        return view('pages.browse-courses', compact('courses', 'enrolledIds') + ['pageTitle' => 'Browse Courses']);
    }
}
