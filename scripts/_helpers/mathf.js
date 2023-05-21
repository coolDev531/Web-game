class Mathf {
  static clamp(value, min, max) {
    // returns the smaller value of the bigger value of the value and the min.
    return Math.min(Math.max(value, min), max);
  }
  static distance(x1, x2) {
    return Math.abs(x1 - x2);
  }

  // static distance(x1, y1, x2, y2) {
  //     return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  // }
}
