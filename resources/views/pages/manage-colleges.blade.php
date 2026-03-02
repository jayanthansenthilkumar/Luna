@extends('layouts.app')

@section('content')
<div class="toolbar">
    <div class="toolbar-left"></div>
    <div class="toolbar-right">
        <button class="btn btn-primary" onclick="showCollegeModal()"><i class="fas fa-plus"></i> Add College</button>
    </div>
</div>

<div class="table-responsive">
    <table class="table" id="collegesTable">
        <thead><tr><th>#</th><th>Name</th><th>Code</th><th>City</th><th>Users</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
            @foreach($colleges as $i => $c)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $c->name }}</td>
                    <td>{{ $c->code }}</td>
                    <td>{{ $c->city }}</td>
                    <td>{{ $c->users_count }}</td>
                    <td><span class="badge badge-{{ $c->status === 'active' ? 'active' : 'inactive' }}">{{ $c->status }}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="editCollege({{ $c->id }})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCollege({{ $c->id }})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection

@push('scripts')
<script>
function escapeHtml(str) { if(!str) return ''; return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

$(document).ready(function() { $('#collegesTable').DataTable(); });

function showCollegeModal() {
    Swal.fire({
        title: 'Add College', html:
        '<div class="form-group"><label class="form-label">Name</label><input id="sColName" class="swal2-input" placeholder="College name"></div>'+
        '<div class="form-group"><label class="form-label">Code</label><input id="sColCode" class="swal2-input" placeholder="Short code"></div>'+
        '<div class="form-group"><label class="form-label">City</label><input id="sColCity" class="swal2-input" placeholder="City"></div>'+
        '<div class="form-group"><label class="form-label">Address</label><input id="sColAddr" class="swal2-input" placeholder="Address"></div>',
        showCancelButton: true, confirmButtonText: 'Add',
        preConfirm: () => {
            const name = document.getElementById('sColName').value.trim();
            if (!name) { Swal.showValidationMessage('Name is required'); return false; }
            return { name, code: document.getElementById('sColCode').value.trim(), city: document.getElementById('sColCity').value.trim(), address: document.getElementById('sColAddr').value.trim() };
        }
    }).then(r => {
        if (r.isConfirmed) {
            $.post('{{ route("api.colleges.store") }}', { ...r.value }, function(res) {
                if (res.status === 200) { Swal.fire('Success', res.message, 'success').then(() => location.reload()); }
                else Swal.fire('Error', res.message, 'error');
            }, 'json').fail(function(xhr){ var msg='Something went wrong'; try{var r=JSON.parse(xhr.responseText);if(r.message)msg=r.message;}catch(e){} Swal.fire('Error',msg,'error'); });
        }
    });
}

function editCollege(id) {
    $.post('{{ route("api.colleges") }}', {}, function(res) {
        if (res.status === 200) {
            const c = res.data.find(x => x.id === id);
            if (!c) return;
            Swal.fire({
                title: 'Edit College', html:
                '<div class="form-group"><label class="form-label">Name</label><input id="sColName" class="swal2-input" value="'+escapeHtml(c.name)+'"></div>'+
                '<div class="form-group"><label class="form-label">Code</label><input id="sColCode" class="swal2-input" value="'+escapeHtml(c.code)+'"></div>'+
                '<div class="form-group"><label class="form-label">City</label><input id="sColCity" class="swal2-input" value="'+escapeHtml(c.city)+'"></div>'+
                '<div class="form-group"><label class="form-label">Address</label><input id="sColAddr" class="swal2-input" value="'+escapeHtml(c.address||'')+'"></div>'+
                '<div class="form-group"><label class="form-label">Status</label><select id="sColStatus" class="swal2-input"><option value="active"'+(c.status==='active'?' selected':'')+'>Active</option><option value="inactive"'+(c.status==='inactive'?' selected':'')+'>Inactive</option></select></div>',
                showCancelButton: true, confirmButtonText: 'Update',
                preConfirm: () => ({ id, name: document.getElementById('sColName').value.trim(), code: document.getElementById('sColCode').value.trim(), city: document.getElementById('sColCity').value.trim(), address: document.getElementById('sColAddr').value.trim(), status: document.getElementById('sColStatus').value })
            }).then(r => {
                if (r.isConfirmed) {
                    $.post('{{ route("api.colleges.update") }}', r.value, function(res) {
                        if (res.status === 200) { Swal.fire('Updated', res.message, 'success').then(() => location.reload()); }
                        else Swal.fire('Error', res.message, 'error');
                    }, 'json').fail(function(xhr){ var msg='Something went wrong'; try{var r=JSON.parse(xhr.responseText);if(r.message)msg=r.message;}catch(e){} Swal.fire('Error',msg,'error'); });
                }
            });
        }
    }, 'json');
}

function deleteCollege(id) {
    Swal.fire({ title: 'Delete College?', text: 'This cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Delete' }).then(r => {
        if (r.isConfirmed) {
            $.post('{{ route("api.colleges.delete") }}', { id }, function(res) {
                if (res.status === 200) { Swal.fire('Deleted', res.message, 'success').then(() => location.reload()); }
                else Swal.fire('Error', res.message, 'error');
            }, 'json').fail(function(xhr){ var msg='Something went wrong'; try{var r=JSON.parse(xhr.responseText);if(r.message)msg=r.message;}catch(e){} Swal.fire('Error',msg,'error'); });
        }
    });
}
</script>
@endpush
