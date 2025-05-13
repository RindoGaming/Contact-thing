class Camera {
    constructor() {
        if (!("mediaDevices" in navigator) || !("getUserMedia" in navigator.mediaDevices)) {
            throw new Error('Camera API not supported in this browser');
        }
        this.stream = null;
    }

    async getStream() {
        if (this.stream) {
            return this.stream;
        }
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            return this.stream;
        } catch (error) {
            this.stopStream();
            console.error('Error accessing camera:', error);
            throw error;
        }
    }

    stopStream() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }
}

export default Camera;
