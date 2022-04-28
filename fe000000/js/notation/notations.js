function baseFormat() {
  return ADNotations.formatMantissa(NotationOptions.displayBase(), NotationOptions.displayDigits());
}

function representExponentWithAlphabet(x, a) {
  let r = [];
  while (x > 0) {
    r.push(a[(x - 1) % a.length]);
    x = Math.floor((x - 1) / a.length);
  }
  r.reverse();
  return r.join('');
}

// General notes about the below notations:
// None of them define canHandleNegativePlaces. This is because
// FE000000 always makes sure to define places when calling format,
// because the format method is only called via the functions in format.js,
// all of which define places in their call to the method. So the issue of
// "what if places is undefined" that canHandleNegativePlaces was meant
// to handle never comes up.

class TimeScientificNotation extends ADNotations.Notation {
  get name() {
    return "Scientific";
  }
  
  formatUnder1000(value, places) {
    return ADNotations.formatMantissaBaseTen(value, places);
  }

  formatDecimal(value, places) {
    return ADNotations.formatMantissaWithExponent(ADNotations.formatMantissaBaseTen,
      (n, p) => this.formatExponent(n, p, (n, _) => ADNotations.formatMantissaBaseTen(n, 0), 0),
      10, 1, true)(value, places);
  }
}

class ScientificNotation extends ADNotations.Notation {
  get name() {
    return "Scientific";
  }
  
  formatUnder1000(value, places) {
    return baseFormat()(value, places);
  }

  formatDecimal(value, places) {
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, p) => this.formatExponent(n, p, (n, _) => baseFormat()(n, 0), 0),
      NotationOptions.exponentBase(), 1, true)(value, places);
  }
}

class StandardNotation extends ADNotations.Notation {
  get name() {
    return "Standard";
  }
  
  formatUnder1000(value, places) {
    return baseFormat()(value, places);
  }

  formatDecimal(value, places) {
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, _) => ADNotations.abbreviateStandard(n),
      Math.pow(NotationOptions.exponentBase(), 3), 1, true, ' ', false)(value, places);
  }
}

class LogarithmNotation extends ADNotations.Notation {
  get name() {
    return "Logarithm";
  }
  
  formatUnder1000(value, places) {
    return baseFormat()(value, places);
  }

  formatDecimal(value, places) {
    const logBase = value.log(NotationOptions.exponentBase());
    return `e${this.formatExponent(logBase, places, baseFormat(), 0)}`;
  }
}

class EngineeringNotation extends ADNotations.Notation {
  get name() {
    return "Engineering";
  }
  
  formatUnder1000(value, places) {
    return baseFormat()(value, places);
  }

  formatDecimal(value, places) {
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, p) => this.formatExponent(n, p, (n, _) => baseFormat()(n, 0), 0),
      NotationOptions.exponentBase(), 3, true)(value, places);
  }
}

class LettersNotation extends ADNotations.Notation {
  get name() {
    return "Letters";
  }
  
  formatUnder1000(value, places) {
    return baseFormat()(value, places);
  }

  formatDecimal(value, places) {
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, _) => representExponentWithAlphabet(n, NotationOptions.alphabet()),
      NotationOptions.exponentBase(), 1, true, '')(value, places);
  }
}

// Below are mixed notations.
let standard = new StandardNotation();
let scientific = new ScientificNotation();

class MixedScientificNotation extends ADNotations.Notation {
  get name() {
    return "Mixed Scientific";
  }
  
  formatUnder1000(value, places) {
    return baseFormat()(value, places);
  }

  formatDecimal(value, places) {
    if (value.lt(1e33)) {
      return standard.formatDecimal(value, places);
    }
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, p) => this.formatExponent(n, p, (n, _) => baseFormat()(n, 0), 0),
      NotationOptions.exponentBase(), 1, true)(value, places);
  }
}

class MixedEngineeringNotation extends ADNotations.Notation {
  get name() {
    return "Mixed Engineering";
  }
  
  formatUnder1000(value, places) {
    return baseFormat()(value, places);
  }

  formatDecimal(value, places) {
    if (value.lt(1e33)) {
      return standard.formatDecimal(value, places);
    }
    return ADNotations.formatMantissaWithExponent(baseFormat(),
      (n, p) => this.formatExponent(n, p, (n, _) => baseFormat()(n, 0), 0),
      NotationOptions.exponentBase(), 3, true)(value, places);
  }
}

class MixedLogarithmSciNotation extends ADNotations.Notation {
  get name() {
    return "Mixed Logarithm (Sci)";
  }
  
  formatUnder1000(value, places) {
    return baseFormat()(value, places);
  }

  formatDecimal(value, places) {
    if (value.lt(1e33)) {
      return scientific.formatDecimal(value, places);
    }
    const logBase = value.log(NotationOptions.exponentBase());
    return `e${this.formatExponent(logBase, places, baseFormat(), 0)}`;
  }
}

let ModifiedNotations = {
  'TimeScientificNotation': TimeScientificNotation,
  'ScientificNotation': ScientificNotation,
  'StandardNotation': StandardNotation,
  'LogarithmNotation': LogarithmNotation,
  'LettersNotation': LettersNotation,
  'EngineeringNotation': EngineeringNotation,
  'MixedScientificNotation': MixedScientificNotation,
  'MixedEngineeringNotation': MixedEngineeringNotation,
  'MixedLogarithmSciNotation': MixedLogarithmSciNotation,
}
