@extends('layouts.app')

@section('content')
<div class="cards-grid" id="browse-courses-ssr">
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
                @if($c->category)<span class="badge badge-role">{{ $c->category }}</span>@endif
            </div>
            <div class="course-card-footer">
                <span><i class="fas fa-layer-group"></i> {{ $c->contents_count }} lessons</span>
                @if(in_array($c->id, $enrolledIds))
                    <span class="badge badge-active">Enrolled</span>
                @else
                    <button class="btn btn-primary btn-sm" onclick="enrollCourse({{ $c->id }})"><i class="fas fa-plus"></i> Enroll</button>
                @endif
            </div>
        </div>
    @empty
        <div class="text-center" style="grid-column:1/-1;padding:3rem;">
            <i class="fas fa-compass" style="font-size:3rem;opacity:0.3;"></i>
            <p style="margin-top:1rem;opacity:0.6;">No courses available for your college yet.</p>
        </div>
    @endforelse
</div>
@endsection

@push('scripts')
<script>
function enrollCourse(id){
    Swal.fire({title:'Enroll in Course?',icon:'question',showCancelButton:true,confirmButtonColor:'#10b981',confirmButtonText:'Yes, Enroll Me'}).then(r=>{
        if(r.isConfirmed){$.post('{{ route("api.enroll") }}',{courseId:id},function(res){if(res.status===200){Swal.fire('Enrolled!',res.message,'success').then(()=>{window.location.href='{{ route("my-learning") }}';});}else Swal.fire('Error',res.message,'error');},'json');}
    });
}
</script>
@endpush
