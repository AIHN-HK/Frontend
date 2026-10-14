import { Navigate, Outlet, useLocation } from 'react-router';
import { useSession } from '@/shared/session/session';
import { useAdminIdentity } from '@/modules/admin';
import { ApiError } from '@/shared/api/api-error';
import { AsyncState } from '@/shared/ui/AsyncState';
import { paths } from '../paths';
export function RequireAdmin(){
 const current=useSession(),location=useLocation(),identity=useAdminIdentity();
 if(current.status==='loading')return <AsyncState state="loading" title="Đang khôi phục phiên…"/>;
 if(current.status==='anonymous')return <Navigate to={`${paths.login}?returnTo=${encodeURIComponent(location.pathname+location.search+location.hash)}`} replace/>;
 if(identity.isPending)return <AsyncState state="loading" title="Đang xác minh quyền quản trị…"/>;
 if(identity.data===null||(identity.error instanceof ApiError&&identity.error.status===403))return <AsyncState state="unavailable" title="Bạn không có quyền quản trị"/>;
 if(identity.isError||identity.data?.id!==current.user?.id)return <AsyncState state="error" title="Quyền quản trị chưa được xác minh" action={<button className="btn btn-secondary" onClick={()=>void identity.refetch()}>Xác minh lại</button>}/>;
 return <div key={`${current.user.id}-${current.revision}`}><Outlet/></div>;
}
