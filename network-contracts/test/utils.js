exports.getErrorReason = function(err) {
  const errors = [];
  for (hash in err.results) {
    errors.push(err.results[hash].reason);
  }

  return errors[0];
}

