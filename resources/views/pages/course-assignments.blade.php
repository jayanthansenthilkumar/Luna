@extends('layouts.app')

@section('content')
<div class="section-toolbar">
    <select id="assignCourseSelect" class="form-input form-input-sm" onchange="loadAssignments()" style="max-width:300px;">
        <option value="">-- Select Course --</option>
        @foreach($courses as $c)
            <option value="{{ $c->id }}">{{ $c->title }} ({{ $c->courseCode }})</option>
        @endforeach
    </select>
    <button class="btn btn-primary" onclick="showAssignModal()"><i class="fas fa-plus"></i> Assign to College</button>
</div>

<div class="table-responsive">
    <table class="table" id="assignmentsTable">
        <thead><tr><th>#</th><th>College</th><th>Code</th><th>Assigned By</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody><tr><td colspan="6" class="text-center">Select a course above</td></tr></tbody>
    </table>
</div>
@endsection

@push('scripts')
<script>
function escapeHtml(t){if(!t)return '';return $('<div>').text(t).html();}

function loadAssignments(){
    var courseId=$('#assignCourseSelect').val();
    if(!courseId){$('#assignmentsTable tbody').html('<tr><td colspan="6" class="text-center">Select a course above</td></tr>');return;}
    $.post('{{ route("api.assignments") }}',{courseId:courseId},function(res){
        if(res.status===200){
            var html='';
            if(!res.data.length){html='<tr><td colspan="6" class="text-center">No assignments found</td></tr>';}
            else res.data.forEach(function(a,i){
                html+='<tr><td>'+(i+1)+'</td><td>'+escapeHtml(a.college?a.college.name:'-')+'</td><td>'+(a.college?a.college.code||'-':'-')+'</td><td>'+escapeHtml(a.assigned_by_user?a.assigned_by_user.name:'-')+'</td><td>'+(a.assignedAt?new Date(a.assignedAt).toLocaleDateString():'')+'</td><td><button class="btn btn-sm btn-danger" onclick="deleteAssignment('+a.id+')"><i class="fas fa-trash"></i></button></td></tr>';
            });
            $('#assignmentsTable tbody').html(html);
        }
    },'json');
}

function showAssignModal(){
    var courseId=$('#assignCourseSelect').val();
    if(!courseId){Swal.fire('Select Course','Please select a course first','warning');return;}
    $.post('{{ route("api.colleges") }}',{},function(res){
        if(res.status===200){
            var opts=res.data.map(c=>'<option value="'+c.id+'">'+escapeHtml(c.name)+' ('+escapeHtml(c.code)+')</option>').join('');
            Swal.fire({title:'Assign Course to College',html:'<select id="swal-assignCollege" class="swal2-input">'+opts+'</select>',showCancelButton:true,confirmButtonText:'Assign',preConfirm:()=>({courseId:courseId,collegeId:document.getElementById('swal-assignCollege').value})}).then(r=>{
                if(r.isConfirmed){$.post('{{ route("api.assignments.store") }}',r.value,function(res2){if(res2.status===200){Swal.fire('Assigned',res2.message,'success');loadAssignments();}else Swal.fire('Error',res2.message,'error');},'json');}
            });
        }
    },'json');
}

function deleteAssignment(id){
    Swal.fire({title:'Remove Assignment?',icon:'warning',showCancelButton:true,confirmButtonColor:'#d33',confirmButtonText:'Remove'}).then(r=>{
        if(r.isConfirmed){$.post('{{ route("api.assignments.delete") }}',{id:id},function(res){if(res.status===200){Swal.fire('Removed',res.message,'success');loadAssignments();}else Swal.fire('Error',res.message,'error');},'json');}
    });
}
</script>
@endpush
