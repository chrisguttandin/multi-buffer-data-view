export class MutliBufferDataView {

    private _buffers: ArrayBuffer[];

    private _byteLength: number;

    private _byteOffset: number;

    private _dataViews: DataView[];

    constructor (buffers: ArrayBuffer[], byteOffset = 0, byteLength?: number) {
        if (byteOffset < 0 || (byteLength !== undefined && byteLength < 0)) {
            throw new RangeError();
        }

        const availableBytes = buffers.reduce((length, buffer) => length + buffer.byteLength, 0);

        if (byteOffset > availableBytes || (byteLength !== undefined && (byteOffset + byteLength) > availableBytes)) {
            throw new RangeError();
        }

        const dataViews = [ ];
        const effectiveByteLength = (byteLength === undefined) ? availableBytes - byteOffset : byteLength;
        const truncatedBuffers = [ ];

        let consumedByteLength = 0;
        let truncatedByteOffset = byteOffset;

        for (const buffer of buffers) {
            if (truncatedBuffers.length === 0) {
                if (buffer.byteLength > truncatedByteOffset) {
                    consumedByteLength = buffer.byteLength - truncatedByteOffset;

                    const byteLengthOfDataView = (consumedByteLength > effectiveByteLength) ? effectiveByteLength : consumedByteLength;

                    dataViews.push(new DataView(buffer, truncatedByteOffset, byteLengthOfDataView));
                    truncatedBuffers.push(buffer);
                } else {
                    truncatedByteOffset -= buffer.byteLength;
                }
            } else if (truncatedBuffers.length > 0 && consumedByteLength < effectiveByteLength) {
                consumedByteLength += buffer.byteLength;

                const byteLengthOfDataView = (consumedByteLength > effectiveByteLength)
                    ? buffer.byteLength - consumedByteLength + effectiveByteLength
                    : buffer.byteLength;

                dataViews.push(new DataView(buffer, 0, byteLengthOfDataView));
                truncatedBuffers.push(buffer);
            }
        }

        this._buffers = truncatedBuffers;
        this._byteLength = effectiveByteLength;
        this._byteOffset = truncatedByteOffset;
        this._dataViews = dataViews;
    }

    get buffers (): ArrayBuffer[] {
        return this._buffers;
    }

    get byteLength (): number {
        return this._byteLength;
    }

    get byteOffset (): number {
        return this._byteOffset;
    }

    // @todo public getFloat32 (byteOffset: number, littleEndian?: boolean): number;

    // @todo public getFloat64 (byteOffset: number, littleEndian?: boolean): number;

    public getInt16 (byteOffset: number, littleEndian?: boolean): number {
        const uint16 = this.getUint16(byteOffset, littleEndian);

        return ((uint16 & 0x8000) === 0) ? uint16 : uint16 ^ -0x10000; // tslint:disable-line:no-bitwise
    }

    // @todo public getInt32 (byteOffset: number, littleEndian?: boolean): number;

    public getInt8 (byteOffset: number): number {
        const [ dataView, byteOffsetOfDataView ] = this._findDataViewWithOffset(byteOffset);

        return dataView.getInt8(byteOffset - byteOffsetOfDataView);
    }

    public getUint16 (byteOffset: number, littleEndian?: boolean): number {
        if (littleEndian === true) {
            return this.getUint8(byteOffset) + (this.getUint8(byteOffset + 1) << 8); // tslint:disable-line:no-bitwise
        }

        return (this.getUint8(byteOffset) << 8) + this.getUint8(byteOffset + 1); // tslint:disable-line:no-bitwise
    }

    public getUint32 (byteOffset: number, littleEndian?: boolean): number {
        const value = (littleEndian === true)
            ? (this.getUint8(byteOffset)
                + (this.getUint8(byteOffset + 1) << 8) // tslint:disable-line:no-bitwise
                + (this.getUint8(byteOffset + 2) << 16) // tslint:disable-line:no-bitwise
                + (this.getUint8(byteOffset + 3) << 24)) // tslint:disable-line:no-bitwise
            : ((this.getUint8(byteOffset) << 24) // tslint:disable-line:no-bitwise
                + (this.getUint8(byteOffset + 1) << 16) // tslint:disable-line:no-bitwise
                + (this.getUint8(byteOffset + 2) << 8) // tslint:disable-line:no-bitwise
                + this.getUint8(byteOffset + 3));

        if (value < 0) {
            return value + (2 ** 32);
        }

        return value;
    }

    public getUint8 (byteOffset: number): number {
        const [ dataView, byteOffsetOfDataView ] = this._findDataViewWithOffset(byteOffset);

        return dataView.getUint8(byteOffset - byteOffsetOfDataView);
    }

    // @todo public setFloat32 (byteOffset: number, value: number, littleEndian?: boolean): void;

    // @todo public setFloat64 (byteOffset: number, value: number, littleEndian?: boolean): void;

    public setInt16 (byteOffset: number, value: number, littleEndian?: boolean): void {
        this.setUint16(byteOffset, value, littleEndian);
    }

    // @todo public setInt32 (byteOffset: number, value: number, littleEndian?: boolean): void;

    public setInt8 (byteOffset: number, value: number): void {
        const [ dataView, byteOffsetOfDataView ] = this._findDataViewWithOffset(byteOffset);

        dataView.setInt8(byteOffset - byteOffsetOfDataView, value);
    }

    public setUint16 (byteOffset: number, value: number, littleEndian?: boolean): void {
        if (littleEndian === true) {
            this.setUint8(byteOffset, value);
            this.setUint8(byteOffset + 1, value >> 8); // tslint:disable-line:no-bitwise
        } else {
            this.setUint8(byteOffset, value >> 8); // tslint:disable-line:no-bitwise
            this.setUint8(byteOffset + 1, value);
        }
    }

    // @todo public setUint32 (byteOffset: number, value: number, littleEndian?: boolean): void;

    public setUint8 (byteOffset: number, value: number): void {
        const [ dataView, byteOffsetOfDataView ] = this._findDataViewWithOffset(byteOffset);

        dataView.setUint8(byteOffset - byteOffsetOfDataView, value);
    }

    private _findDataViewWithOffset (byteOffset: number): [ DataView, number ] {
        let byteOffsetOfDataView = 0;

        for (const dataView of this._dataViews) {
            const byteOffsetOfNextDataView = byteOffsetOfDataView + dataView.byteLength;

            if (byteOffset >= byteOffsetOfDataView && byteOffset < byteOffsetOfNextDataView) {
                return [ dataView, byteOffsetOfDataView ];
            }

            byteOffsetOfDataView = byteOffsetOfNextDataView;
        }

        throw new RangeError();
    }

}
