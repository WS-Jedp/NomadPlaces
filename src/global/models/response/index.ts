class Response<Content> {

    protected content: Content
    protected status: number

    constructor(properties: { content: Content, status: number }) {
        this.content = properties.content
        this.status = properties.status
    }

    httpResponse() {
        return {
            status: this.status,
            content: this.content
        }
    }

}

export default Response