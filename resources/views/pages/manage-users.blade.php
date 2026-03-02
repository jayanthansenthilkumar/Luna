@extends('layouts.app')

@section('content')
<div class="toolbar">
    <div class="toolbar-left">
        <select id="userRoleFilter" class="form-input" style="width:auto;min-width:150px;" onchange="loadUsers()">
            <option value="">All Roles</option>
            @if(auth()->user()->role === 'superAdmin')<option value="adminAzhagii">Admin Azhagii</option>@endif
            <option value="azhagiiCoordinator">Coordinator</option>
            <option value="azhagiiStudents">Student</option>
        </select>
        <select id="userCollegeFilter" class="form-input" style="width:auto;min-width:180px;" onchange="loadUsers()">
            <option value="">All Colleges</option>
            @foreach($colleges as $c)
                <option value="{{ $c->id }}">{{ $c->name }}</option>
            @endforeach
        </select>
    </div>
    <div class="toolbar-right">
        <button class="btn btn-primary" onclick="showUserModal()"><i class="fas fa-plus"></i> Add User</button>
    </div>
</div>

<div class="table-responsive">
    <table class="table" id="usersTable">
        <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>College</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
            @foreach($users as $i => $u)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $u->name }}</td>
                    <td>{{ $u->email }}</td>
                    <td><span class="badge badge-draft">{{ $u->role }}</span></td>
                    <td>{{ $u->college->name ?? 'N/A' }}</td>
                    <td><span class="badge badge-{{ $u->status === 'active' ? 'active' : 'inactive' }}">{{ $u->status }}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="editUser({{ $u->id }})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser({{ $u->id }})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection

@push('scripts')
<script>
const collegesList = @json($colleges);
function escapeHtml(str) { if(!str) return ''; return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

$(document).ready(function() { $('#usersTable').DataTable(); });

function loadUsers() {
    const role = $('#userRoleFilter').val();
    const collegeId = $('#userCollegeFilter').val();
    $.post('{{ route("api.users") }}', { role_filter: role, college_filter: collegeId }, function(res) {
        if (res.status === 200) {
            if ($.fn.DataTable.isDataTable('#usersTable')) $('#usersTable').DataTable().destroy();
            let html = '';
            res.data.forEach((u, i) => {
                html += '<tr><td>'+(i+1)+'</td><td>'+escapeHtml(u.name)+'</td><td>'+escapeHtml(u.email)+'</td><td><span class="badge badge-draft">'+escapeHtml(u.role)+'</span></td><td>'+escapeHtml(u.college?u.college.name:'N/A')+'</td><td><span class="badge badge-'+(u.status==='active'?'active':'inactive')+'">'+escapeHtml(u.status)+'</span></td><td><button class="btn btn-sm btn-outline" onclick="editUser('+u.id+')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteUser('+u.id+')"><i class="fas fa-trash"></i></button></td></tr>';
            });
            $('#usersTable tbody').html(html || '<tr><td colspan="7" class="empty-state">No users found</td></tr>');
            $('#usersTable').DataTable();
        }
    }, 'json');
}

function showUserModal() {
    let collegeOpts = '<option value="">Select College</option>';
    collegesList.forEach(c => { collegeOpts += '<option value="'+c.id+'">'+escapeHtml(c.name)+'</option>'; });
    let roleOpts = '';
    @if(auth()->user()->role === 'superAdmin')
    roleOpts += '<option value="adminAzhagii">Admin Azhagii</option>';
    @endif
    roleOpts += '<option value="azhagiiCoordinator">Coordinator</option><option value="azhagiiStudents">Student</option>';

    Swal.fire({
        title:'Add User', html:
        '<div class="form-group"><label class="form-label">Name</label><input id="sUName" class="swal2-input" placeholder="Full name"></div>'+
        '<div class="form-group"><label class="form-label">Email</label><input id="sUEmail" class="swal2-input" type="email" placeholder="Email"></div>'+
        '<div class="form-group"><label class="form-label">Username</label><input id="sUUsername" class="swal2-input" placeholder="Username"></div>'+
        '<div class="form-group"><label class="form-label">Password</label><input id="sUPass" class="swal2-input" type="password" placeholder="Password"></div>'+
        '<div class="form-group"><label class="form-label">Role</label><select id="sURole" class="swal2-input" onchange="toggleCollegeField(this.value)">'+roleOpts+'</select></div>'+
        '<div class="form-group" id="collegeGroup"><label class="form-label">College</label><select id="sUCollege" class="swal2-input">'+collegeOpts+'</select></div>',
        showCancelButton:true, confirmButtonText:'Add',
        preConfirm: () => {
            const name = document.getElementById('sUName').value.trim();
            const email = document.getElementById('sUEmail').value.trim();
            const username = document.getElementById('sUUsername').value.trim();
            const password = document.getElementById('sUPass').value;
            const role = document.getElementById('sURole').value;
            if (!name||!email||!username||!password||!role) { Swal.showValidationMessage('All fields are required'); return false; }
            return { name, email, username, password, role, collegeId: document.getElementById('sUCollege').value };
        }
    }).then(r => {
        if (r.isConfirmed) {
            $.post('{{ route("api.users.store") }}', r.value, function(res) {
                if (res.status===200) { Swal.fire('Success',res.message,'success').then(() => location.reload()); }
                else Swal.fire('Error',res.message,'error');
            },'json').fail(function(xhr){ var msg='Something went wrong'; try{var r=JSON.parse(xhr.responseText);if(r.message)msg=r.message;}catch(e){} Swal.fire('Error',msg,'error'); });
        }
    });
}

function toggleCollegeField(role) {
    const g = document.getElementById('collegeGroup');
    if (role === 'adminAzhagii' || role === 'superAdmin') g.style.display = 'none';
    else g.style.display = 'block';
}

function editUser(id) {
    $.post('{{ route("api.users.detail") }}', { userId: id }, function(res) {
        if (res.status === 200) {
            const u = res.data;
            let collegeOpts = '<option value="">Select College</option>';
            collegesList.forEach(c => { collegeOpts += '<option value="'+c.id+'"'+(c.id==u.collegeId?' selected':'')+'>'+escapeHtml(c.name)+'</option>'; });
            let roleOpts = '';
            @if(auth()->user()->role === 'superAdmin')
            roleOpts += '<option value="adminAzhagii"'+(u.role==='adminAzhagii'?' selected':'')+'>Admin Azhagii</option>';
            @endif
            roleOpts += '<option value="azhagiiCoordinator"'+(u.role==='azhagiiCoordinator'?' selected':'')+'>Coordinator</option><option value="azhagiiStudents"'+(u.role==='azhagiiStudents'?' selected':'')+'>Student</option>';
            Swal.fire({
                title:'Edit User', html:
                '<div class="form-group"><label class="form-label">Name</label><input id="sUName" class="swal2-input" value="'+escapeHtml(u.name)+'"></div>'+
                '<div class="form-group"><label class="form-label">Email</label><input id="sUEmail" class="swal2-input" value="'+escapeHtml(u.email)+'"></div>'+
                '<div class="form-group"><label class="form-label">Role</label><select id="sURole" class="swal2-input">'+roleOpts+'</select></div>'+
                '<div class="form-group"><label class="form-label">College</label><select id="sUCollege" class="swal2-input">'+collegeOpts+'</select></div>'+
                '<div class="form-group"><label class="form-label">Status</label><select id="sUStatus" class="swal2-input"><option value="active"'+(u.status==='active'?' selected':'')+'>Active</option><option value="inactive"'+(u.status==='inactive'?' selected':'')+'>Inactive</option></select></div>',
                showCancelButton:true, confirmButtonText:'Update',
                preConfirm: () => ({ id, name: document.getElementById('sUName').value.trim(), email: document.getElementById('sUEmail').value.trim(), role: document.getElementById('sURole').value, collegeId: document.getElementById('sUCollege').value, status: document.getElementById('sUStatus').value })
            }).then(r => {
                if (r.isConfirmed) {
                    $.post('{{ route("api.users.update") }}', r.value, function(res) {
                        if(res.status===200){Swal.fire('Updated',res.message,'success').then(()=>location.reload());}else Swal.fire('Error',res.message,'error');
                    },'json').fail(function(xhr){ var msg='Something went wrong'; try{var r=JSON.parse(xhr.responseText);if(r.message)msg=r.message;}catch(e){} Swal.fire('Error',msg,'error'); });
                }
            });
        }
    },'json');
}

function deleteUser(id) {
    Swal.fire({title:'Delete User?',text:'This cannot be undone.',icon:'warning',showCancelButton:true,confirmButtonColor:'#d33',confirmButtonText:'Delete'}).then(r=>{
        if(r.isConfirmed){$.post('{{ route("api.users.delete") }}',{id},function(res){if(res.status===200){Swal.fire('Deleted',res.message,'success').then(()=>location.reload());}else Swal.fire('Error',res.message,'error');},'json').fail(function(xhr){ var msg='Something went wrong'; try{var r=JSON.parse(xhr.responseText);if(r.message)msg=r.message;}catch(e){} Swal.fire('Error',msg,'error'); });}
    });
}
</script>
@endpush
