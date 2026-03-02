@extends('layouts.app')

@section('content')
<div class="section-toolbar">
    <select id="studentCourseSelect" class="form-input form-input-sm" onchange="loadCourseStudents()" style="max-width:300px;">
        <option value="">-- Select Course --</option>
        @foreach($courses as $c)
            <option value="{{ $c->id }}">{{ $c->title }} ({{ $c->courseCode }})</option>
        @endforeach
    </select>
</div>

<div class="table-responsive">
    <table class="table" id="courseStudentsTable">
        <thead><tr><th>#</th><th>Student</th><th>Email</th><th>Phone</th><th>Progress</th><th>Status</th><th>Enrolled</th></tr></thead>
        <tbody><tr><td colspan="7" class="text-center">Select a course above</td></tr></tbody>
    </table>
</div>
@endsection

@push('scripts')
<script>
function escapeHtml(t){if(!t)return '';return $('<div>').text(t).html();}

function loadCourseStudents(){
    var courseId=$('#studentCourseSelect').val();
    if(!courseId){$('#courseStudentsTable tbody').html('<tr><td colspan="7" class="text-center">Select a course above</td></tr>');return;}
    $.post('{{ route("api.course-students") }}',{courseId:courseId},function(res){
        if(res.status===200){
            var html='';
            if(!res.data.length) html='<tr><td colspan="7" class="text-center">No students enrolled</td></tr>';
            else res.data.forEach(function(s,i){
                var statusBadge=s.progress>=100?'<span class="badge badge-active">Completed</span>':'<span class="badge badge-pending">In Progress</span>';
                html+='<tr><td>'+(i+1)+'</td><td><strong>'+escapeHtml(s.student?s.student.name:'-')+'</strong>'+(s.student&&s.student.rollNumber?'<br><small style="opacity:0.6;">'+escapeHtml(s.student.rollNumber)+'</small>':'')+'</td><td>'+escapeHtml(s.student?s.student.email:'-')+'</td><td>'+(s.student?s.student.phone||'-':'-')+'</td><td><div style="display:flex;align-items:center;gap:0.5rem;"><div class="progress-bar-wrap" style="width:100px;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;"><div class="progress-bar-fill" style="width:'+s.progress+'%;height:100%;background:#4ade80;border-radius:3px;"></div></div><span style="font-size:0.8rem;">'+s.progress+'%</span></div></td><td>'+statusBadge+'</td><td>'+(s.enrolledAt?new Date(s.enrolledAt).toLocaleDateString():'')+'</td></tr>';
            });
            $('#courseStudentsTable tbody').html(html);
        }
    },'json');
}
</script>
@endpush
