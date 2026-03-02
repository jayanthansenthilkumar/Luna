@extends('layouts.app')

@push('styles')
<style>
    .requests-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem}
    .request-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.25rem;transition:all .3s}
    .request-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.15);border-color:rgba(66,133,244,0.3)}
    .req-header{display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem}
    .req-avatar{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#4285f4,#a78bfa);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1.1rem;flex-shrink:0}
    .req-info h4{margin:0;font-size:0.95rem}
    .req-info p{margin:0;font-size:0.8rem;opacity:0.6}
    .req-meta{font-size:0.8rem;opacity:0.5;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.35rem}
    .req-reason{background:var(--body);border:1px solid var(--border);border-radius:8px;padding:0.75rem;margin-bottom:1rem;font-size:0.9rem;line-height:1.5}
    .req-actions{display:flex;gap:0.75rem}
    .btn-approve{background:rgba(16,185,129,0.15);color:#10b981;border:1px solid rgba(16,185,129,0.2);border-radius:8px;padding:0.5rem 1rem;cursor:pointer;font-weight:500;transition:all .2s;flex:1;display:flex;align-items:center;justify-content:center;gap:0.5rem}
    .btn-approve:hover{background:#10b981;color:#fff}
    .btn-reject{background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:0.5rem 1rem;cursor:pointer;font-weight:500;transition:all .2s;flex:1;display:flex;align-items:center;justify-content:center;gap:0.5rem}
    .btn-reject:hover{background:#ef4444;color:#fff}
</style>
@endpush

@section('content')
<div class="header-actions section-toolbar">
    <div>
        <h2 style="margin:0;">Access Requests</h2>
        <p style="opacity:0.6;margin:0.25rem 0 0;">Manage user requests to unlock and edit their profiles.</p>
    </div>
    <button class="btn btn-outline btn-sm" onclick="location.reload()"><i class="fas fa-sync-alt"></i> Refresh</button>
</div>

<div class="requests-grid" id="requestsContainer">
    @forelse($requests as $req)
        <div class="request-card" id="req-{{ $req->id }}">
            <div class="req-header">
                <div class="req-avatar">{{ strtoupper(substr($req->user->name ?? '', 0, 1)) }}</div>
                <div class="req-info">
                    <h4>{{ $req->user->name ?? 'Unknown' }}</h4>
                    <p>{{ $req->user->college->name ?? 'N/A' }}</p>
                    <p>{{ $req->user->email ?? '' }}</p>
                </div>
            </div>
            <div class="req-meta"><i class="fas fa-clock"></i> {{ date('M d, Y h:i A', strtotime($req->createdAt)) }}</div>
            <div class="req-reason"><strong>Reason:</strong><br>{!! nl2br(e($req->requestReason)) !!}</div>
            <div class="req-actions">
                <button class="btn-approve" onclick="resolveRequest({{ $req->id }}, 'approve')"><i class="fas fa-check"></i> Approve</button>
                <button class="btn-reject" onclick="resolveRequest({{ $req->id }}, 'reject')"><i class="fas fa-times"></i> Reject</button>
            </div>
        </div>
    @empty
        <div style="grid-column:1/-1;text-align:center;padding:3rem;">
            <i class="fas fa-check-circle" style="font-size:3rem;opacity:0.2;color:#10b981;"></i>
            <p style="margin-top:1rem;opacity:0.6;">No pending requests.</p>
        </div>
    @endforelse
</div>
@endsection

@push('scripts')
<script>
function resolveRequest(id, action){
    var isApprove = action === 'approve';
    Swal.fire({
        title: isApprove ? 'Approve Request?' : 'Reject Request?',
        text: isApprove ? 'User will be able to edit their profile immediately.' : 'User will be notified of rejection.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: isApprove ? '#10b981' : '#ef4444',
        confirmButtonText: isApprove ? 'Approve' : 'Reject'
    }).then(r=>{
        if(r.isConfirmed){
            $.post('{{ route("api.profile.resolve") }}', {request_id: id, action: action}, function(res){
                if(res.status === 200){
                    $('#req-'+id).fadeOut(400, function(){ $(this).remove(); });
                    Swal.fire({icon:'success',title:isApprove?'Approved':'Rejected',toast:true,position:'top-end',showConfirmButton:false,timer:2000});
                } else Swal.fire('Error', res.message, 'error');
            }, 'json');
        }
    });
}
</script>
@endpush
