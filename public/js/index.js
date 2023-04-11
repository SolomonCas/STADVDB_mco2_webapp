$(document).ready(function () {
    console.log("Document Ready");
    $('#movies_table').DataTable();

    $('.selected_row').on('click', (function() {
      const parentTr = $(this).closest('tr');
      const selected_row = {
        id: parentTr.find('td').eq(1).text(),
        name: parentTr.find('td').eq(2).text(),
        year: parentTr.find('td').eq(3).text(),
        rank: parentTr.find('td').eq(4).text(),
        genre: parentTr.find('td').eq(5).text(),
        director_first_name: parentTr.find('td').eq(6).text(),
        director_last_name: parentTr.find('td').eq(7).text()
      }

      $('#update_id').val(selected_row.id);
      $('#update_name').val(selected_row.name);
      $('#update_year').val(selected_row.year);
      $('#update_rank').val(selected_row.rank);
      $('#update_genre').val(selected_row.genre);
      $('#update_director_first_name').val(selected_row.director_first_name);
      $('#update_director_last_name').val(selected_row.director_last_name);

    }));

});