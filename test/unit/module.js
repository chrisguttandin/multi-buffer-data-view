import { MultiBufferDataView } from '../../src/module';
import { combineArrayBuffers } from '../helpers/combine-array-buffers';

describe('multi-buffer-data-view', () => {
    describe('MultiBufferDataView', () => {
        describe('constructor', () => {
            let buffers;

            beforeEach(() => {
                buffers = [new ArrayBuffer(12), new ArrayBuffer(24)];
            });

            describe('with a negative byteOffset', () => {
                it('should throw a RangeError', () => {
                    expect(() => new MultiBufferDataView(buffers, -1)).to.throw(RangeError);
                });
            });

            describe('with a byteOffset outside of the given buffers', () => {
                it('should throw a RangeError', () => {
                    expect(() => new MultiBufferDataView(buffers, 37)).to.throw(RangeError);
                });
            });

            describe('with a negative byteLength', () => {
                it('should throw a RangeError', () => {
                    expect(() => new MultiBufferDataView(buffers, 0, -1)).to.throw(RangeError);
                });
            });

            describe('with a byteLength that exceeds the number of available bytes', () => {
                it('should throw a RangeError', () => {
                    expect(() => new MultiBufferDataView(buffers, 0, 37)).to.throw(RangeError);
                });
            });
        });

        describe('buffers', () => {
            let buffers;

            beforeEach(() => {
                buffers = [new ArrayBuffer(12), new ArrayBuffer(6), new ArrayBuffer(24)];
            });

            describe('without a byteOffset and byteLength', () => {
                let multiBufferDataView;

                beforeEach(() => {
                    multiBufferDataView = new MultiBufferDataView(buffers);
                });

                it('should return all buffers', () => {
                    expect(multiBufferDataView.buffers).to.deep.equal(buffers);
                });
            });

            describe('with a byteOffset within the second buffer', () => {
                describe('without a byteLength', () => {
                    let multiBufferDataView;

                    beforeEach(() => {
                        multiBufferDataView = new MultiBufferDataView(buffers, 12);
                    });

                    it('should return only the buffers from the second buffer onwards', () => {
                        expect(multiBufferDataView.buffers).to.deep.equal(buffers.slice(1));
                    });
                });

                describe('with a byteLength that is equal to the length of the second buffer', () => {
                    let multiBufferDataView;

                    beforeEach(() => {
                        multiBufferDataView = new MultiBufferDataView(buffers, 12, 6);
                    });

                    it('should return only the second buffer', () => {
                        expect(multiBufferDataView.buffers).to.deep.equal([buffers[1]]);
                    });
                });
            });
        });

        describe('byteLength', () => {
            let buffers;

            beforeEach(() => {
                buffers = [new ArrayBuffer(12), new ArrayBuffer(24)];
            });

            describe('without a byteLength', () => {
                let multiBufferDataView;

                beforeEach(() => {
                    multiBufferDataView = new MultiBufferDataView(buffers, 0);
                });

                it('should return the available length as byteLength', () => {
                    expect(multiBufferDataView.byteLength).to.equal(36);
                });
            });

            describe('with a byteLength', () => {
                let byteLength;
                let multiBufferDataView;

                beforeEach(() => {
                    byteLength = 30;
                    multiBufferDataView = new MultiBufferDataView(buffers, 0, byteLength);
                });

                it('should return the given byteLength', () => {
                    expect(multiBufferDataView.byteLength).to.equal(byteLength);
                });
            });
        });

        describe('byteOffset', () => {
            let buffers;

            beforeEach(() => {
                buffers = [new ArrayBuffer(12), new ArrayBuffer(24)];
            });

            describe('without as byteOffset', () => {
                let multiBufferDataView;

                beforeEach(() => {
                    multiBufferDataView = new MultiBufferDataView(buffers);
                });

                it('should return zero', () => {
                    expect(multiBufferDataView.byteOffset).to.equal(0);
                });
            });

            describe('with a byteOffset within the first buffer', () => {
                let byteOffset;
                let multiBufferDataView;

                beforeEach(() => {
                    byteOffset = 8;
                    multiBufferDataView = new MultiBufferDataView(buffers, byteOffset);
                });

                it('should return the given byteOffset', () => {
                    expect(multiBufferDataView.byteOffset).to.equal(byteOffset);
                });
            });

            describe('with a byteOffset within the second buffer', () => {
                let byteOffset;
                let multiBufferDataView;

                beforeEach(() => {
                    byteOffset = 16;
                    multiBufferDataView = new MultiBufferDataView(buffers, byteOffset);
                });

                it('should return the truncated byteOffset', () => {
                    expect(multiBufferDataView.byteOffset).to.equal(4);
                });
            });
        });

        describe('getFloat32()', () => {
            let buffers;
            let dataView;
            let multiBufferDataView;

            beforeEach(() => {
                const float32Array = new Float32Array(Array.from({ length: 20 }, () => Math.random() * 10 - 5));

                buffers = [float32Array.buffer.slice(0, 5), float32Array.buffer.slice(5)];
                dataView = new DataView(float32Array.buffer);
                multiBufferDataView = new MultiBufferDataView(buffers);
            });

            describe('without any littleEndian flag', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 77; i += 1) {
                        const value = multiBufferDataView.getFloat32(i);

                        if (Number.isNaN(value)) {
                            expect(dataView.getFloat32(i)).to.be.NaN;
                        } else {
                            expect(value).to.equal(dataView.getFloat32(i));
                        }
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getFloat32(77)).to.throw(RangeError);
                });
            });

            describe('with the littleEndian flag set to true', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 77; i += 1) {
                        const value = multiBufferDataView.getFloat32(i, true);

                        if (Number.isNaN(value)) {
                            expect(dataView.getFloat32(i, true)).to.be.NaN;
                        } else {
                            expect(value).to.equal(dataView.getFloat32(i, true));
                        }
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getFloat32(77, true)).to.throw(RangeError);
                });
            });

            describe('with the littleEndian flag set to false', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 77; i += 1) {
                        const value = multiBufferDataView.getFloat32(i, false);

                        if (Number.isNaN(value)) {
                            expect(dataView.getFloat32(i, false)).to.be.NaN;
                        } else {
                            expect(value).to.equal(dataView.getFloat32(i));
                        }
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getFloat32(77, false)).to.throw(RangeError);
                });
            });
        });

        describe('getFloat64()', () => {
            let buffers;
            let dataView;
            let multiBufferDataView;

            beforeEach(() => {
                const float64Array = new Float64Array(Array.from({ length: 20 }, () => Math.random() * 10 - 5));

                buffers = [float64Array.buffer.slice(0, 5), float64Array.buffer.slice(5)];
                dataView = new DataView(float64Array.buffer);
                multiBufferDataView = new MultiBufferDataView(buffers);
            });

            describe('without any littleEndian flag', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 153; i += 1) {
                        const value = multiBufferDataView.getFloat64(i);

                        if (Number.isNaN(value)) {
                            expect(dataView.getFloat64(i)).to.be.NaN;
                        } else {
                            expect(value).to.equal(dataView.getFloat64(i));
                        }
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getFloat64(153)).to.throw(RangeError);
                });
            });

            describe('with the littleEndian flag set to true', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 153; i += 1) {
                        const value = multiBufferDataView.getFloat64(i, true);

                        if (Number.isNaN(value)) {
                            expect(dataView.getFloat64(i, true)).to.be.NaN;
                        } else {
                            expect(value).to.equal(dataView.getFloat64(i, true));
                        }
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getFloat64(153, true)).to.throw(RangeError);
                });
            });

            describe('with the littleEndian flag set to false', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 153; i += 1) {
                        const value = multiBufferDataView.getFloat64(i, false);

                        if (Number.isNaN(value)) {
                            expect(dataView.getFloat64(i, false)).to.be.NaN;
                        } else {
                            expect(value).to.equal(dataView.getFloat64(i));
                        }
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getFloat64(153, false)).to.throw(RangeError);
                });
            });
        });

        describe('getInt16()', () => {
            let buffers;
            let dataView;
            let multiBufferDataView;

            beforeEach(() => {
                const int16Array = new Int16Array(Array.from({ length: 20 }, () => Math.floor(Math.random() * 2 ** 16) - 2 ** 15));

                buffers = [int16Array.buffer.slice(0, 5), int16Array.buffer.slice(5)];
                dataView = new DataView(int16Array.buffer);
                multiBufferDataView = new MultiBufferDataView(buffers);
            });

            describe('without any littleEndian flag', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 39; i += 1) {
                        expect(multiBufferDataView.getInt16(i)).to.equal(dataView.getInt16(i));
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getInt16(39)).to.throw(RangeError);
                });
            });

            describe('with the littleEndian flag set to true', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 39; i += 1) {
                        expect(multiBufferDataView.getInt16(i, true)).to.equal(dataView.getInt16(i, true));
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getInt16(39, true)).to.throw(RangeError);
                });
            });

            describe('with the littleEndian flag set to false', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 39; i += 1) {
                        expect(multiBufferDataView.getInt16(i, false)).to.equal(dataView.getInt16(i, false));
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getInt16(39, false)).to.throw(RangeError);
                });
            });
        });

        describe('getInt32()', () => {
            let buffers;
            let dataView;
            let multiBufferDataView;

            beforeEach(() => {
                const int32Array = new Int32Array(Array.from({ length: 20 }, () => Math.floor(Math.random() * 2 ** 32) - 2 ** 31));

                buffers = [int32Array.buffer.slice(0, 5), int32Array.buffer.slice(5)];
                dataView = new DataView(int32Array.buffer);
                multiBufferDataView = new MultiBufferDataView(buffers);
            });

            describe('without any littleEndian flag', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 77; i += 1) {
                        expect(multiBufferDataView.getInt32(i)).to.equal(dataView.getInt32(i));
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getInt32(77)).to.throw(RangeError);
                });
            });

            describe('with the littleEndian flag set to true', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 77; i += 1) {
                        expect(multiBufferDataView.getInt32(i, true)).to.equal(dataView.getInt32(i, true));
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getInt32(77, true)).to.throw(RangeError);
                });
            });

            describe('with the littleEndian flag set to false', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 77; i += 1) {
                        expect(multiBufferDataView.getInt32(i, false)).to.equal(dataView.getInt32(i, false));
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getInt32(77, false)).to.throw(RangeError);
                });
            });
        });

        describe('getInt8()', () => {
            let buffers;
            let dataView;
            let multiBufferDataView;

            beforeEach(() => {
                const int8Array = new Int8Array(Array.from({ length: 20 }, () => Math.floor(Math.random() * 2 ** 8) - 2 ** 7));

                buffers = [int8Array.buffer.slice(0, 5), int8Array.buffer.slice(5)];
                dataView = new DataView(int8Array.buffer);
                multiBufferDataView = new MultiBufferDataView(buffers);
            });

            it('should return the same values as a DataView', () => {
                for (let i = 0; i < 20; i += 1) {
                    expect(multiBufferDataView.getInt8(i)).to.equal(dataView.getInt8(i));
                }
            });

            it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                expect(() => multiBufferDataView.getInt16(20)).to.throw(RangeError);
            });
        });

        describe('getUint16()', () => {
            let buffers;
            let dataView;
            let multiBufferDataView;

            beforeEach(() => {
                const uint16Array = new Uint16Array(Array.from({ length: 20 }, () => Math.floor(Math.random() * 2 ** 16)));

                buffers = [uint16Array.buffer.slice(0, 5), uint16Array.buffer.slice(5)];
                dataView = new DataView(uint16Array.buffer);
                multiBufferDataView = new MultiBufferDataView(buffers);
            });

            describe('without any littleEndian flag', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 39; i += 1) {
                        expect(multiBufferDataView.getUint16(i)).to.equal(dataView.getUint16(i));
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getUint16(39)).to.throw(RangeError);
                });
            });

            describe('with the littleEndian flag set to true', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 39; i += 1) {
                        expect(multiBufferDataView.getUint16(i, true)).to.equal(dataView.getUint16(i, true));
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getUint16(39, true)).to.throw(RangeError);
                });
            });

            describe('with the littleEndian flag set to false', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 39; i += 1) {
                        expect(multiBufferDataView.getUint16(i, false)).to.equal(dataView.getUint16(i, false));
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getUint16(39, false)).to.throw(RangeError);
                });
            });
        });

        describe('getUint32()', () => {
            let buffers;
            let dataView;
            let multiBufferDataView;

            beforeEach(() => {
                const uint32Array = new Uint32Array(Array.from({ length: 20 }, () => Math.floor(Math.random() * 2 ** 32)));

                buffers = [uint32Array.buffer.slice(0, 5), uint32Array.buffer.slice(5)];
                dataView = new DataView(uint32Array.buffer);
                multiBufferDataView = new MultiBufferDataView(buffers);
            });

            describe('without any littleEndian flag', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 77; i += 1) {
                        expect(multiBufferDataView.getUint32(i)).to.equal(dataView.getUint32(i));
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getUint32(77)).to.throw(RangeError);
                });
            });

            describe('with the littleEndian flag set to true', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 77; i += 1) {
                        expect(multiBufferDataView.getUint32(i, true)).to.equal(dataView.getUint32(i, true));
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getUint32(77, true)).to.throw(RangeError);
                });
            });

            describe('with the littleEndian flag set to false', () => {
                it('should return the same values as a DataView', () => {
                    for (let i = 0; i < 77; i += 1) {
                        expect(multiBufferDataView.getUint32(i, false)).to.equal(dataView.getUint32(i, false));
                    }
                });

                it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                    expect(() => multiBufferDataView.getUint32(77, false)).to.throw(RangeError);
                });
            });
        });

        describe('getUint8()', () => {
            let buffers;
            let dataView;
            let multiBufferDataView;

            beforeEach(() => {
                const uint8Array = new Uint8Array(Array.from({ length: 20 }, () => Math.floor(Math.random() * 2 ** 8)));

                buffers = [uint8Array.buffer.slice(0, 5), uint8Array.buffer.slice(5)];
                dataView = new DataView(uint8Array.buffer);
                multiBufferDataView = new MultiBufferDataView(buffers);
            });

            it('should return the same values as a DataView', () => {
                for (let i = 0; i < 20; i += 1) {
                    expect(multiBufferDataView.getUint8(i)).to.equal(dataView.getUint8(i));
                }
            });

            it('should throw a RangeError when the byteOffset would require to read unavailable bytes', () => {
                expect(() => multiBufferDataView.getUint8(20)).to.throw(RangeError);
            });
        });

        describe('setFloat32()', () => {
            let buffers;
            let multiBufferDataView;
            let values;

            beforeEach(() => {
                buffers = [new ArrayBuffer(5), new ArrayBuffer(75)];
                multiBufferDataView = new MultiBufferDataView(buffers);
                values = new Float32Array(Array.from({ length: 20 }, () => Math.random() * 10 - 5));
            });

            describe('without any littleEndian flag', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setFloat32(i * 4, values[i]);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getFloat32(i * 4)).to.equal(values[i]);
                    }
                });
            });

            describe('with the littleEndian flag set to true', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setFloat32(i * 4, values[i], true);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getFloat32(i * 4, true)).to.equal(values[i]);
                    }
                });
            });

            describe('with the littleEndian flag set to false', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setFloat32(i * 4, values[i], false);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getFloat32(i * 4, false)).to.equal(values[i]);
                    }
                });
            });
        });

        describe('setFloat64()', () => {
            let buffers;
            let multiBufferDataView;
            let values;

            beforeEach(() => {
                buffers = [new ArrayBuffer(5), new ArrayBuffer(155)];
                multiBufferDataView = new MultiBufferDataView(buffers);
                values = new Float64Array(Array.from({ length: 20 }, () => Math.random() * 10 - 5));
            });

            describe('without any littleEndian flag', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setFloat64(i * 8, values[i]);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getFloat64(i * 8)).to.equal(values[i]);
                    }
                });
            });

            describe('with the littleEndian flag set to true', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setFloat64(i * 8, values[i], true);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getFloat64(i * 8, true)).to.equal(values[i]);
                    }
                });
            });

            describe('with the littleEndian flag set to false', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setFloat64(i * 8, values[i], false);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getFloat64(i * 8, false)).to.equal(values[i]);
                    }
                });
            });
        });

        describe('setInt16()', () => {
            let buffers;
            let multiBufferDataView;
            let values;

            beforeEach(() => {
                buffers = [new ArrayBuffer(5), new ArrayBuffer(35)];
                multiBufferDataView = new MultiBufferDataView(buffers);
                values = Array.from({ length: 20 }, () => Math.floor(Math.random() * 2 ** 16) - 2 ** 15);
            });

            describe('without any littleEndian flag', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setInt16(i * 2, values[i]);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getInt16(i * 2)).to.equal(values[i]);
                    }
                });
            });

            describe('with the littleEndian flag set to true', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setInt16(i * 2, values[i], true);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getInt16(i * 2, true)).to.equal(values[i]);
                    }
                });
            });

            describe('with the littleEndian flag set to false', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setInt16(i * 2, values[i], false);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getInt16(i * 2, false)).to.equal(values[i]);
                    }
                });
            });
        });

        describe('setInt32()', () => {
            let buffers;
            let multiBufferDataView;
            let values;

            beforeEach(() => {
                buffers = [new ArrayBuffer(5), new ArrayBuffer(75)];
                multiBufferDataView = new MultiBufferDataView(buffers);
                values = Array.from({ length: 20 }, () => Math.floor(Math.random() * 2 ** 32) - 2 ** 31);
            });

            describe('without any littleEndian flag', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setInt32(i * 4, values[i]);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getInt32(i * 4)).to.equal(values[i]);
                    }
                });
            });

            describe('with the littleEndian flag set to true', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setInt32(i * 4, values[i], true);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getInt32(i * 4, true)).to.equal(values[i]);
                    }
                });
            });

            describe('with the littleEndian flag set to false', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setInt32(i * 4, values[i], false);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getInt32(i * 4, false)).to.equal(values[i]);
                    }
                });
            });
        });

        describe('setInt8()', () => {
            let buffers;
            let multiBufferDataView;
            let values;

            beforeEach(() => {
                buffers = [new ArrayBuffer(5), new ArrayBuffer(15)];
                multiBufferDataView = new MultiBufferDataView(buffers);
                values = Array.from({ length: 20 }, () => Math.floor(Math.random() * 2 ** 8) - 2 ** 7);
            });

            it('should write the same values as if using a DataView', () => {
                for (let i = 0; i < 20; i += 1) {
                    multiBufferDataView.setInt8(i, values[i]);
                }

                const dataView = combineArrayBuffers(buffers);

                for (let i = 0; i < 20; i += 1) {
                    expect(dataView.getInt8(i)).to.equal(values[i]);
                }
            });
        });

        describe('setUint16()', () => {
            let buffers;
            let multiBufferDataView;
            let values;

            beforeEach(() => {
                buffers = [new ArrayBuffer(5), new ArrayBuffer(35)];
                multiBufferDataView = new MultiBufferDataView(buffers);
                values = Array.from({ length: 20 }, () => Math.floor(Math.random() * 2 ** 16));
            });

            describe('without any littleEndian flag', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setUint16(i * 2, values[i]);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getUint16(i * 2)).to.equal(values[i]);
                    }
                });
            });

            describe('with the littleEndian flag set to true', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setUint16(i * 2, values[i], true);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getUint16(i * 2, true)).to.equal(values[i]);
                    }
                });
            });

            describe('with the littleEndian flag set to false', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setUint16(i * 2, values[i], false);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getUint16(i * 2, false)).to.equal(values[i]);
                    }
                });
            });
        });

        describe('setUint32()', () => {
            let buffers;
            let multiBufferDataView;
            let values;

            beforeEach(() => {
                buffers = [new ArrayBuffer(5), new ArrayBuffer(75)];
                multiBufferDataView = new MultiBufferDataView(buffers);
                values = Array.from({ length: 20 }, () => Math.floor(Math.random() * 2 ** 32));
            });

            describe('without any littleEndian flag', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setUint32(i * 4, values[i]);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getUint32(i * 4)).to.equal(values[i]);
                    }
                });
            });

            describe('with the littleEndian flag set to true', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setUint32(i * 4, values[i], true);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getUint32(i * 4, true)).to.equal(values[i]);
                    }
                });
            });

            describe('with the littleEndian flag set to false', () => {
                it('should write the same values as if using a DataView', () => {
                    for (let i = 0; i < 20; i += 1) {
                        multiBufferDataView.setUint32(i * 4, values[i], false);
                    }

                    const dataView = combineArrayBuffers(buffers);

                    for (let i = 0; i < 20; i += 1) {
                        expect(dataView.getUint32(i * 4, false)).to.equal(values[i]);
                    }
                });
            });
        });

        describe('setUint8()', () => {
            let buffers;
            let multiBufferDataView;
            let values;

            beforeEach(() => {
                buffers = [new ArrayBuffer(5), new ArrayBuffer(15)];
                multiBufferDataView = new MultiBufferDataView(buffers);
                values = Array.from({ length: 20 }, () => Math.floor(Math.random() * 2 ** 8));
            });

            it('should write the same values as if using a DataView', () => {
                for (let i = 0; i < 20; i += 1) {
                    multiBufferDataView.setUint8(i, values[i]);
                }

                const dataView = combineArrayBuffers(buffers);

                for (let i = 0; i < 20; i += 1) {
                    expect(dataView.getUint8(i)).to.equal(values[i]);
                }
            });
        });
    });
});
