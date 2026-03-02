@extends('layouts.app')

@section('content')
<div class="cards-grid" id="coord-courses-ssr">
    @forelse($courses as $c)
        <div class="course-card">
            <div class="course-card-thumb">
                @if($c->thumbnailUrl)
                    <img src="{{ asset($c->thumbnailUrl) }}" alt="{{ $c->title }}">
                @else
                    <div style="height:100%;display:flex;align-items:center;justify-content:center;background:rgba(66,133,244,0.1);"><i class="fas fa-book" style="font-size:2rem;color:#4285f4;"></i></div>
                @endif
            </div>
            <div class="course-card-body">
                <h3>{{ $c->title }}</h3>
                <p>{{ Str::limit($c->description, 100) }}</p>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                    @if($c->category)<span class="badge badge-role">{{ $c->category }}</span>@endif
                    @if($c->createdBy == auth()->id())
                        <span class="badge badge-draft">Created by Me</span>
                    @else
                        <span class="badge badge-active">Assigned</span>
                    @endif
                </div>
            </div>
            <div class="course-card-footer">
                <span><i class="fas fa-layer-group"></i> {{ $c->contents_count }} lessons</span>
                <button class="btn btn-outline btn-sm" onclick="viewCourseDetail({{ $c->id }})"><i class="fas fa-eye"></i> Details</button>
            </div>
        </div>
    @empty
        <div class="text-center" style="grid-column:1/-1;padding:3rem;">
            <i class="fas fa-book-open" style="font-size:3rem;opacity:0.3;"></i>
            <p style="margin-top:1rem;opacity:0.6;">No courses assigned or created yet.</p>
        </div>
    @endforelse
</div>
@endsection

@push('scripts')
<script>
function escapeHtml(t){if(!t)return '';return $('<div>').text(t).html();}
function viewCourseDetail(id){
    $.post('{{ route("api.courses.detail") }}',{courseId:id},function(res){
        if(res.status===200){var c=res.data;
        Swal.fire({title:escapeHtml(c.title),html:'<div style="text-align:left;"><p><strong>Code:</strong> '+(c.courseCode||'N/A')+'</p><p><strong>Category:</strong> '+(c.category||'N/A')+'</p><p><strong>Semester:</strong> '+(c.semester||'N/A')+'</p><p><strong>Description:</strong> '+(c.description||'N/A')+'</p>'+(c.syllabusUrl?'<p><a href="/'+c.syllabusUrl+'" target="_blank">View Syllabus</a></p>':'')+'</div>',width:500});}
    },'json');
}
</script>
@endpush
