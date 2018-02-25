$(document).ready(function() {
  $("#version").html("v0.14");
  
  $("#searchbutton").click( function (e) {
    displayModal();
  });
  
  $("#searchfield").keydown( function (e) {
    if(e.keyCode == 13) {
      displayModal();
    }	
  });
  var offset = 0;
  var images = [];
  function displayModal() {
    $(  "#myModal").modal('show');

    $("#status").html("Searching...");
    $("#dialogtitle").html("Search for: "+$("#searchfield").val());
    $("#previous").hide();
    $("#next").hide();
    $.getJSON('/search/' + $("#searchfield").val() , function(data) {
      images = data;
      offset = 0;
      renderQueryResults(data, offset);
    });
  }
  
  $("#next").click( function(e) {
    offset++;
    renderQueryResults(images, offset);
  });
  
  $("#previous").click( function(e) {
    offset--;
    renderQueryResults(images, offset);
  });

  function renderQueryResults(data, offset) {
    
    if (data.error != undefined) {
      $("#status").html("Error: "+data.error);
    } else {
      $("#status").html(""+data.num_results+" result(s)");

      for(let i = 0; i < 4; i++){
        $(`#photo${i}`).empty();
        if(i + (offset * 4) < data.results.length)
          $(`#photo${i}`).append(`<img src="${data.results[i + (offset * 4)]}" style="max-width:40%; max-height:40%;" />`);
      }
      
      if((offset * 4) + 4 < data.results.length){
        $("#next").show();
      }else {
        $("#next").hide();
      }
      if((offset * 4) - 4 >= 0){
        $("#previous").show();
      }else {
        $("#previous").hide();
      }
      
     }
   }
});
