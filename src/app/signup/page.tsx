import { redirect } from "next/navigation"

// 회원가입 페이지 접근 시 메인 페이지로 리디렉션
export default function SignUpPage(){
    // 메인 페이지로 리디렉션하고 상태 파라미터를 전달해 회원가입 모달이 열리게 할 수 있습니다
    // 지금은 단순 리디렉션만 구현
    redirect("/")
}