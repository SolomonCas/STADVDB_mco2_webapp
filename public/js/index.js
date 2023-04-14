$(document).ready(function () {
	console.log("Document Ready");
    var page = parseInt($('#page').html());
    var total = parseInt($('#total').html());
    if(page == 1){
        $('#prev_page').prop('disabled', true);
        $('#next_page').prop('disabled', false);
    }
    if(total == 1){
        $('#next_page').prop('disabled', true);
        $('#prev_page').prop('disabled', true);
    }
    else if(page == total){
        $('#next_page').prop('disabled', true);
        $('#prev_page').prop('disabled', false);
    }

    // highlight selected row
    $('#movies_table tbody tr').on('click', function () {
        $('#movies_table tbody tr').removeClass('bg-info');
        $(this).addClass('bg-info');

        const parentTr = $(this).closest('tr');
        const selected_row = {
            id: parentTr.find('td').eq(0).text(),
            name: parentTr.find('td').eq(1).text(),
            year: parentTr.find('td').eq(2).text(),
            rank: parentTr.find('td').eq(3).text(),
            genre: parentTr.find('td').eq(4).text(),
            director_first_name: parentTr.find('td').eq(5).text(),
            director_last_name: parentTr.find('td').eq(6).text()
        }

        $('#update_submit').prop('disabled', false);

        $('#update_id').val(selected_row.id);
        $('#update_name').val(selected_row.name);
        $('#update_year').val(selected_row.year);
        $('#update_rank').val(selected_row.rank);
        $('#update_genre').val(selected_row.genre);
        $('#update_director_first_name').val(selected_row.director_first_name);
        $('#update_director_last_name').val(selected_row.director_last_name);
    })

  // delete button
    $('.delete_button').on('click', function () {
        const parentTr = $(this).closest('tr');
        const id = parentTr.find('td').eq(0).text();
        const year = parseInt(parentTr.find('td').eq(2).text());
        // send post request to delete a row
        $.post('/delete', { id, year })
            .done(function (response) {
                // redirect to '/' if success
                window.location.replace('/');
            })
            .fail(function (xhr, status, error) {
                console.error(error);
            });
    })

    $('#next_page').on('click', function(){
        page++;
        if(window.location.href.includes("filter")){
            window.location.href = "/filter/" + page;
        }
        else if(window.location.href.includes("search")){
            window.location.href = "/search/" + page;
        }
        else{
            window.location.href = "/" + page;
        }
        
    });

    $('#prev_page').on('click', function(){
        page--;
        if(window.location.href.includes("filter")){
            window.location.href = "/filter/" + page;
        }
        else if(window.location.href.includes("search")){
            window.location.href = "/search/" + page;
        }
        else{
            window.location.href = "/" + page;
        }
        
    });
    
    $('#clear_filter').on('click', function(){
        window.location.href = "/";
    });
});