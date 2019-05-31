export const combineArrayBuffers = (buffers) => {
    const byteLength = buffers.reduce((accumulatedByteLength, arrayBuffer) => accumulatedByteLength + arrayBuffer.byteLength, 0);
    const arrayBuffer = new ArrayBuffer(byteLength);
    const uint8Array = new Uint8Array(arrayBuffer);

    buffers.reduce((byteOffset, buffer) => {
        uint8Array.set(new Uint8Array(buffer), byteOffset);

        return byteOffset + buffer.byteLength;
    }, 0);

    return new DataView(arrayBuffer);
};
