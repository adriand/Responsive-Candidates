function stripRoot(url) {
  return url.replace("http://elections.raisethehammer.org/api", "")
}

// from "http://elections.raisethehammer.org/api/candidate/70/1" to 
// "http://elections.raisethehammer.org/candidate/70/1"
function apiURLtoPublicURL(url) {
  return url.replace("api/", "");
}

function urlForCandidate(candidate) {
  return "<a href='" + apiURLtoPublicURL(candidate.url) + "'>" + niceName(candidate.name) + "</a>";
}

function candidateURLs(candidates) {
  var urls = [];
  for (var i = 0; i < candidates.length; i++) {
    urls.push(urlForCandidate(candidates[i]));
  }
  return urls.join(", ");
}

function niceName(name) {
  var nice = name.split(",");
  return nice[1] + " " + nice[0];
}

// parameters: all of the candidates, the ward we want, and whether or not
// we are seeking the most or least responsive candidates.
// returns: an array containing the number of responses that is either most or least
// for the ward, and the candidates who have that many responses.
function getResponsiveCandidatesForWard(all_candidates, ward, most) {
  var candidates = [];
  for (var i = 0; i < all_candidates.length; i++) {
    if (all_candidates[i].ward == ward) {
      candidates.push(all_candidates[i]);
    }
  }
  // sort the candidates to get either the most or least responsive 
  candidates.sort(function (a,b) {
    if (most) {
      return (b.responses - a.responses);
    } else {
      return (a.responses - b.responses);
    }
  });
  var extreme_candidates = []; // the candidates who are either most or least responsive
  var extreme_responses = candidates[0].responses; // the extreme of responses
  // for all of the candidates we're looking at, build a new list that contains every candidate
  // whose response count is equal to the extreme_responses, i.e. all of the people who are tied for
  // most or least responsive.  break out of the loop when the response level changes or when we
  // run out of candidates to look at.
  var j = 0;
  while (j < candidates.length && extreme_responses == candidates[j].responses) {
    extreme_candidates.push(candidates[j]);
    j++;
  }
  return [extreme_responses, extreme_candidates];
}

function displayResponsesByCandidate(question_count, candidates) {
  $("#question_count").html(question_count);

  candidates.sort( function(a, b) {
    return b.responses - a.responses;
  });
  
  for (var j = 0; j < candidates.length; j++) {
    var width = ((candidates[j].responses / question_count) * 100) + "%";
    if (width == "0%") width = "1.5%"; // token line, big enough to show the zero inside
    $("#candidates")
    .append(
      $("<tr>")
      .append(
        $("<th>").append($("<strong>").html(urlForCandidate(candidates[j])))
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

function displayMostAndLeastByWard(candidates, wards, most) {
  if (most) {
    table = $("#most_responsive");
  } else {
    table = $("#least_responsive");
  }
  for (var i = 0; i < wards.length; i++) {
    extremes = getResponsiveCandidatesForWard(candidates, wards[i].ward, most);
    table
    .append(
      $("<tr>")
      .append(
        $("<th>").html(wards[i].ward)
      )
      .append(
        $("<td>").attr("class", "main").html(candidateURLs(extremes[1]))
      )
      .append(
        $("<td>").html(extremes[0])
      )
    );
  }
}

$(function() {
  $('#content').corner("12px");
  $.getJSON("api.php?q=/election/1", function(data) {
    // get the full list of candidates
    var raw_candidates = data.candidates;
    var candidates = [];
    var question_count = data.questions.length;
    
    for (var i = 0; i < raw_candidates.length; i++) {
      // get the details on each candidate and store the relevant information in the candidates array
      $.getJSON("api.php?q=" + stripRoot(raw_candidates[i].url), function(candidate) {
        candidates.push({
          name: candidate.details.name, 
          responses: candidate.responses.length, 
          url: candidate.details.url,
          ward: candidate.details.ward
				});
        if (candidates.length == raw_candidates.length) {
          displayResponsesByCandidate(question_count, candidates);
          displayMostAndLeastByWard(candidates, data.wards, true);
          displayMostAndLeastByWard(candidates, data.wards, false);
        }
      });
    }
    
  });
  
});