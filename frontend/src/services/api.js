
const BASE_URL=import.meta.env.VITE_BASE_URL


export const AUTH={

    REGISTER:BASE_URL+'/user/register',
    VERIFY_EMAIL:BASE_URL+'/user/verify-email',
    LOGIN:BASE_URL+'/user/login',
    FORGOT_PASSWORD:BASE_URL+'/user/forgot-password',
    RESET_PASSWORD:BASE_URL+'/user/reset-password',
    LOGOUT:BASE_URL+'/user/logout',
    CHECK_AUTH:BASE_URL+'/user/check-auth'

}