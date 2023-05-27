class AuthErrorResponse<Content> {

    protected content: Content
    private status: number

    constructor(properties: { content: Content, status: number }) {
        this.content = properties.content
        this.status = properties.status
    }

    httpResponse() {
        return {
            status: this.status,
            content: {
                error: this.content
            }
        }
    }

}

export default AuthErrorResponse