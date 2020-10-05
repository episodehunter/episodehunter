interface ImageData {
  /**
   * Returns the one-dimensional array containing the data in RGBA order, as integers in the range 0 to 255.
   */
  readonly data: Uint8ClampedArray;
  /**
   * Returns the actual dimensions of the data in the ImageData object, in pixels.
   */
  readonly height: number;
  /**
   * Returns the actual dimensions of the data in the ImageData object, in pixels.
   */
  readonly width: number;
}
