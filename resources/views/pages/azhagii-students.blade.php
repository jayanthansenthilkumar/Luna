@extends('layouts.app')

@section('content')
<div class="section-toolbar">
    <select id="studentCollegeFilter" class="form-input form-input-sm" onchange="filterAzhagiiStudentsSSR()" style="max-width:250px;">
        <option value="">All Colleges</option>
        @foreach($colleges as $col)
            <option value="{{ $col->id }}">{{ $col->name }}</option>
        @endforeach
    </select>
</div>

<div class="table-responsive">
    <table class="table" id="azhagiiStudentsTable" style="width:100%;">
        <thead>
            <tr>
                <th>#</th><th>Photo</th><th>Name</th><th>Username</th><th>Azhagii ID</th><th>Email</th><th>Phone</th><th>Gender</th><th>DOB</th><th>College</th><th>Department</th><th>Year</th><th>Roll Number</th><th>Bio</th><th>Address</th><th>Status</th><th>Locked</th><th>Joined</th><th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach($students as $i => $s)
            <tr data-college-id="{{ $s->collegeId }}">
                <td>{{ $i + 1 }}</td>
                <td>
                    @if($s->profilePhoto)
                        <img src="{{ asset($s->profilePhoto) }}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">
                    @else
                        <div class="avatar-circle" style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(66,133,244,0.15);color:#4285f4;font-weight:600;font-size:0.85rem;">{{ strtoupper(substr($s->name,0,1)) }}</div>
                    @endif
                </td>
                <td>{{ $s->name }}</td>
                <td>{{ $s->username }}</td>
                <td>{{ $s->azhagiiID ?? '-' }}</td>
                <td>{{ $s->email }}</td>
                <td>{{ $s->phone ?? '-' }}</td>
                <td>{{ $s->gender ?? '-' }}</td>
                <td>{{ $s->dob ? $s->dob->format('Y-m-d') : '-' }}</td>
                <td>{{ $s->college->name ?? '-' }}</td>
                <td>{{ $s->department ?? '-' }}</td>
                <td>{{ $s->year ?? '-' }}</td>
                <td>{{ $s->rollNumber ?? '-' }}</td>
                <td class="cell-wrap">{{ Str::limit($s->bio, 50) }}</td>
                <td class="cell-wrap">{{ Str::limit($s->address, 50) }}</td>
                <td><span class="badge badge-{{ $s->status === 'active' ? 'active' : 'inactive' }}">{{ $s->status }}</span></td>
                <td><span class="badge badge-{{ $s->isLocked ? 'inactive' : 'active' }}">{{ $s->isLocked ? 'Locked' : 'Unlocked' }}</span></td>
                <td>{{ date('M d, Y', strtotime($s->createdAt)) }}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="editAzhagiiStudent({{ $s->id }})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAzhagiiStudent({{ $s->id }})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection

@push('scripts')
<script>
function escapeHtml(t){if(!t)return '';return $('<div>').text(t).html();}

var azhagiiDT;
$(document).ready(function(){
    azhagiiDT = $('#azhagiiStudentsTable').DataTable({
        columnDefs:[
            {orderable:false,targets:[1,18]},
            {visible:false,targets:[4,5,6,7,8,13,14,15,16,17]}
        ],
        lengthMenu:[[10,25,50,100,-1],[10,25,50,100,"All"]],
        dom:'Bfrtip',
        buttons:['copy','csv','excel','pdf','print','colvis']
    });

    $.fn.dataTable.ext.search.push(function(settings,data,dataIndex){
        if(settings.nTable.id!=='azhagiiStudentsTable') return true;
        var filterVal=$('#studentCollegeFilter').val();
        if(!filterVal) return true;
        var row=$(settings.aoData[dataIndex].nTr);
        return row.data('college-id')==filterVal;
    });
});

function filterAzhagiiStudentsSSR(){azhagiiDT.draw();}

function editAzhagiiStudent(id){
    $.post('{{ route("api.users.detail") }}',{userId:id},function(res){
        if(res.status===200){var u=res.data;
        var collegeOpts='';
        $('#studentCollegeFilter option').each(function(){if(this.value) collegeOpts+='<option value="'+this.value+'"'+(u.collegeId==this.value?' selected':'')+'>'+this.text+'</option>';});
        Swal.fire({title:'Edit Student',html:
            '<div style="max-height:400px;overflow-y:auto;text-align:left;">'+
            '<input type="hidden" id="sw-id" value="'+u.id+'">'+
            '<div class="form-group"><label class="form-label">Full Name</label><input id="sw-name" class="swal2-input" value="'+escapeHtml(u.name)+'"></div>'+
            '<div class="form-group"><label class="form-label">Email</label><input id="sw-email" class="swal2-input" value="'+escapeHtml(u.email)+'"></div>'+
            '<div class="form-group"><label class="form-label">College</label><select id="sw-college" class="swal2-input">'+collegeOpts+'</select></div>'+
            '<div class="form-group"><label class="form-label">Department</label><input id="sw-dept" class="swal2-input" value="'+escapeHtml(u.department||'')+'"></div>'+
            '<div class="form-group"><label class="form-label">Year</label><input id="sw-year" class="swal2-input" value="'+escapeHtml(u.year||'')+'"></div>'+
            '<div class="form-group"><label class="form-label">Roll Number</label><input id="sw-roll" class="swal2-input" value="'+escapeHtml(u.rollNumber||'')+'"></div>'+
            '<div class="form-group"><label class="form-label">Phone</label><input id="sw-phone" class="swal2-input" value="'+escapeHtml(u.phone||'')+'"></div>'+
            '<div class="form-group"><label class="form-label">Status</label><select id="sw-status" class="swal2-input"><option value="active"'+(u.status==='active'?' selected':'')+'>Active</option><option value="inactive"'+(u.status==='inactive'?' selected':'')+'>Inactive</option></select></div>'+
            '</div>',
            showCancelButton:true,confirmButtonText:'Update',
            preConfirm:()=>({id:u.id,name:document.getElementById('sw-name').value.trim(),email:document.getElementById('sw-email').value.trim(),role:'azhagiiStudents',collegeId:document.getElementById('sw-college').value,department:document.getElementById('sw-dept').value.trim(),year:document.getElementById('sw-year').value.trim(),rollNumber:document.getElementById('sw-roll').value.trim(),phone:document.getElementById('sw-phone').value.trim(),status:document.getElementById('sw-status').value})
        }).then(r=>{if(r.isConfirmed){$.post('{{ route("api.users.update") }}',r.value,function(res2){if(res2.status===200)Swal.fire('Updated',res2.message,'success').then(()=>location.reload());else Swal.fire('Error',res2.message,'error');},'json');}});}
    },'json');
}

function deleteAzhagiiStudent(id){
    Swal.fire({title:'Delete Student?',text:'This cannot be undone.',icon:'warning',showCancelButton:true,confirmButtonColor:'#d33',confirmButtonText:'Delete'}).then(r=>{
        if(r.isConfirmed){$.post('{{ route("api.users.delete") }}',{id:id},function(res){if(res.status===200)Swal.fire('Deleted',res.message,'success').then(()=>location.reload());else Swal.fire('Error',res.message,'error');},'json');}
    });
}
</script>
@endpush
