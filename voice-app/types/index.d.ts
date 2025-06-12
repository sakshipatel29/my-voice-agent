
  
  interface User {
    name: string;
    email: string;
    id: string;
  }

  
  interface AgentProps {
    userName: string;
    userId?: string;
    interviewId?: string;
    feedbackId?: string;
    type: "generate" | "interview";
    questions?: string[];
  }
  
  interface RouteParams {
    params: Promise<Record<string, string>>;
    searchParams: Promise<Record<string, string>>;
  }
  
  
  interface SignInParams {
    email: string;
    idToken: string;
  }
  
  interface SignUpParams {
    uid: string;
    name: string;
    email: string;
    password: string;
  }
  
  type FormType = "sign-in" | "sign-up";
  
