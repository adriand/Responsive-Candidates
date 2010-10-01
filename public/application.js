function stripRoot(url) {
  return url.replace("http://elections.raisethehammer.org/api", "")
}

function displayResults(question_count, candidates) {
  $("#question_count").html(question_count);

  candidates.sort( function(a, b) {
    return b.responses - a.responses;
  });
  
  for (var j = 0; j < candidates.length; j++) {
    $("#candidates")
      .append(
        $("<div class='candidate'>").append(
          $("<h3>").html(candidates[j].name + " (" + candidates[j].responses + ")")
        )
      );      
  }  
}

$(function() {
  $('#content').corner("12px");        
  
  $.getJSON("api.php?q=/election/1", function(data) {
    // get the data
    var raw_candidates = data.candidates;
    var candidates = [];
    var question_count = data.questions.length;
    
    for (var i = 0; i < raw_candidates.length; i++) {
      $.getJSON("api.php?q=" + stripRoot(raw_candidates[i].url), function(candidate) {
        candidates.push({name: candidate.details[0].name, responses: candidate.responses.length});
        if (candidates.length == raw_candidates.length) {
          displayResults(question_count, candidates);
        }
      });
    }
    
  });
  
});