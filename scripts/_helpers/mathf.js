class Mathf {
  static clamp(value, min, max) {
    // returns the smaller value of the bigger value of the value and the min.
    return Math.min(Math.max(value, min), max);
  }
}
