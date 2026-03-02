@extends('layouts.app')

@section('content')
<div class="cards-grid" id="my-learning-ssr">
    @forelse($myCourses as $c)
        <div class="course-card" style="cursor:pointer;" onclick="viewCourse({{ $c->courseId }}, {{ $c->id }})">
            <div class="course-card-thumb">
                @if($c->course && $c->course->thumbnailUrl)
                    <img src="{{ asset($c->course->thumbnailUrl) }}" alt="{{ $c->course->title }}">
                @else
                    <div style="height:100%;display:flex;align-items:center;justify-content:center;background:rgba(66,133,244,0.1);"><i class="fas fa-book" style="font-size:2rem;color:#4285f4;"></i></div>
                @endif
            </div>
            <div class="course-card-body">
                <h3>{{ $c->course->title ?? 'Untitled' }}</h3>
                <p>{{ Str::limit($c->course->description ?? '', 80) }}</p>
                <div class="progress-bar-wrap" style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;margin-top:0.5rem;">
                    <div class="progress-bar-fill" style="width:{{ $c->progress }}%;height:100%;background:#4ade80;border-radius:3px;transition:width .3s;"></div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.25rem;font-size:0.8rem;opacity:0.7;">
                    <span>{{ $c->progress }}% complete</span>
                    <span>{{ $c->course->contents_count ?? 0 }} lessons</span>
                </div>
            </div>
            <div class="course-card-footer">
                @if($c->progress >= 100)
                    <span class="badge badge-active">Completed</span>
                @else
                    <span class="badge badge-draft">In Progress</span>
                @endif
                <span style="font-size:0.8rem;opacity:0.6;">Enrolled {{ date('M d, Y', strtotime($c->enrolledAt)) }}</span>
            </div>
        </div>
    @empty
        <div class="text-center" style="grid-column:1/-1;padding:3rem;">
            <i class="fas fa-graduation-cap" style="font-size:3rem;opacity:0.3;"></i>
            <p style="margin-top:1rem;opacity:0.6;">You haven't enrolled in any courses yet.</p>
            <a href="{{ route('browse-courses') }}" class="btn btn-primary" style="margin-top:1rem;">Browse Courses</a>
        </div>
    @endforelse
</div>
@endsection

@push('scripts')
<script>
function viewCourse(courseId, enrollmentId){
    window.location.href='{{ route("course-viewer") }}?courseId='+courseId+'&enrollmentId='+enrollmentId;
}
</script>
@endpush
