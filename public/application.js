function stripRoot(url) {
  return url.replace("http://elections.raisethehammer.org/api", "")
}

// from "http://elections.raisethehammer.org/api/candidate/70/1" to 
// "http://elections.raisethehammer.org/candidate/70/1"
function apiURLtoPublicURL(url) {
	return url.replace("api/", "");
}

function displayResults(question_count, candidates) {
  $("#question_count").html(question_count);

  candidates.sort( function(a, b) {
    return b.responses - a.responses;
  });
  
  for (var j = 0; j < candidates.length; j++) {
    var width = ((candidates[j].responses / question_count) * 100) + "%";
    if (width == "0%") width = "1.5%"; // token line
    $("#candidates")
      .append(
        $("<tr>")
        .append(
          $("<th>").append($("<h3>").html("<a href='" + apiURLtoPublicURL(candidates[j].url) + "'>" + candidates[j].name + "</a>"))
        )
				.append(
					$("<td>").html(candidates[j].ward)
				)
        .append(
          $("<td>").append($("<div class='bar'>").css("width", width).html(candidates[j].responses))
        )
      );      
  }  
}

$(function() {
  $('#content').corner("12px");        
  // break;
  $.getJSON("api.php?q=/election/1", function(data) {
    // get the data
    var raw_candidates = data.candidates;
    var candidates = [];
    var question_count = data.questions.length;
    
    for (var i = 0; i < raw_candidates.length; i++) {
      $.getJSON("api.php?q=" + stripRoot(raw_candidates[i].url), function(candidate) {
        candidates.push({
					name: candidate.details.name, 
					responses: candidate.responses.length, 
					url: candidate.details.url,
					ward: candidate.details.ward
				});
        if (candidates.length == raw_candidates.length) {
          displayResults(question_count, candidates);
        }
      });
    }
    
  });
  
});