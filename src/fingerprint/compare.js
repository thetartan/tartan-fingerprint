'use strict';

var _ = require('lodash');

function colorDistance(left, right) {
  var rmean = (left[0] + right[0]) / 2;
  var r = left[0] - right[0];
  var g = left[1] - right[1];
  var b = left[2] - right[2];
  return Math.sqrt((512 + rmean) * r * r / 256 + 4 * g * g +
    (767 - rmean) * b * b / 256) / 768;
}

function compareColorsHelper(left, right) {
  if ((left.length == 0) || (right.length == 0)) {
    return {sum: 0, restLeft: left, restRight: right};
  }
  right = right.slice(0, right.length);  // copy

  var sum = 0;
  var restLeft = [];
  left.forEach(function(cleft) {
    for (var i = 0; i < right.length; i++) {
      var cright = right[i];
      var dist = colorDistance(cleft, cright);
      if (dist <= 0.07) {
        var diff = cleft[3] - cright[3];
        sum += diff * diff;
        right.splice(i, 1);  // remove it
        return;
      }
    }
    restLeft.push(cleft);
  });
  return {
    sum: sum,
    restLeft: restLeft,
    restRight: right
  };
}

function compareColors(left, right) {
  // Map left colors to right
  var temp = compareColorsHelper(left.cl, right.cl);
  var sum = temp.sum;

  // Add the rest of unmatched with difference against 0,
  // but only if there ae more than one unmatched color and it is not
  // major
  var rest = 1;
  if (temp.restLeft.length + temp.restRight.length == 1) {
    if (temp.restLeft.length == 1) {
      rest = temp.restLeft[0][3];
    }
    if (temp.restRight.length == 1) {
      rest = temp.restRight[0][3];
    }
  }
  if (rest > 0.43) {
    temp.restLeft.forEach(function(value) {
      sum += value[3] * value[3];
    });
    temp.restRight.forEach(function(value) {
      sum += value[3] * value[3];
    });
  }

  // Respect smallest stripes
  var diff = left.clrs - right.clrs;
  sum += diff * diff;

  return Math.sqrt(sum);
}

function compareSequence(left, right) {
  var n = Math.max(left.length, right.length);

  var sum = 0;
  for (var i = 0; i < n; i++) {
    var diff = (left[i] || 0) - (right[i] || 0);
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

function compareColorSequences(left, right) {
  // If one of sequences is empty - consider sequences very far each from other
  if ((left.length == 0) || (right.length == 0)) {
    return 100;
  }

  // Compare all possible pairs and calculate difference
  var pairs = [];
  for (var i = 0; i < left.length; i++) {
    for (var j = 0; j < right.length; j++) {
      pairs.push([
        compareSequence(left[i], right[j]),
        left[i],
        right[j]
      ]);
    }
  }

  // Choose best combinations
  pairs = pairs.sort(function(a, b) {
    return a[0] - b[0];
  });

  var sum = 0;
  var usedLeft = [];
  var usedRight = [];
  pairs.forEach(function(value) {
    var isLeftUsed = usedLeft.indexOf(value[1]) >= 0;
    var isRightUsed = usedRight.indexOf(value[2]) >= 0;
    if (isLeftUsed || isRightUsed) {
      return;
    }

    sum += value[0] * value[0];
    usedLeft.push(value[1]);
    usedRight.push(value[2]);
  });

  // Find and update rest
  left.forEach(function(value) {
    var isUsed = usedLeft.indexOf(value) >= 0;
    if (!isUsed) {
      var diff = compareSequence(value, []);
      sum += diff * diff;
    }
  });
  right.forEach(function(value) {
    var isUsed = usedRight.indexOf(value) >= 0;
    if (!isUsed) {
      var diff = compareSequence(value, []);
      sum += diff * diff;
    }
  });

  return Math.sqrt(sum);
}

function compare(left, right) {
  var color = compareColors(left, right);

  var sett1 = compareSequence(left.wrsq, right.wrsq) +
    compareSequence(left.wfsq, right.wfsq);

  var sett2 = compareColorSequences(left.wrsc, right.wrsc) +
    compareColorSequences(left.wfsc, right.wfsc);

  var w1 = 2 / 5;
  var w2 = 1 - w1;
  var sett = w1 * sett1 + w2 * sett2;

  var q1 = 2 / 7;
  var q2 = 1 - q1;

  return {
    color: color,
    sett: sett,
    total: q1 * color + q2 * sett
  };
}

function search(items, fingerprint, normalizeScore) {
  if (!_.isFunction(normalizeScore)) {
    normalizeScore = function(score) {
      return score.total;
    };
  }

  var result = _.chain(items)
    .map(function(item) {
      var score = compare(fingerprint, item.fingerprint);
      return _.extend({}, item, {
        score: normalizeScore(score)
      });
    })
    .filter()
    .sortBy('score')
    .value();

  var sum = 0;
  var count = 0;
  _.each(result, function(item) {
    if ((item.score > 0) && (item.score <= 5)) {
      sum += item.score;
      count += 1;
    }
    return item.score <= 5;  // continue until we found too bad result
  });
  var threshold = sum / count < 1.21 ? 1.21 : sum / count;

  return _.filter(result, function(item) {
    return item.score <= threshold;
  });
}

module.exports = {
  compare: compare,
  search: search
};
