export type OobRecords = {
    id: string;
    user_id: string;
    token_id: string;
    method: string;
    path: string;
    query?: string;
    ip_address?: string;
    user_agent?: string;
    headers: string;
    body: string;
    created_at: string;
};
