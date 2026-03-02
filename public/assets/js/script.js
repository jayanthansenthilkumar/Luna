$(document).ready(function () {

  // ══════════════════════════════════════════
  //  SMOOTH PAGE TRANSITION
  // ══════════════════════════════════════════
  $('body').css('opacity', 1); // Ensure visible on load

  $('body').on('click', 'a', function (e) {
    const $this = $(this);
    const href = $this.attr('href');
    const target = $this.attr('target');

    // Skip special links
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || target === '_blank') {
      return;
    }
    
    // Allow default if control/cmd key is held (open in new tab)
    if (e.ctrlKey || e.metaKey) return;

    e.preventDefault();
    $('body').css('opacity', 0);
    setTimeout(function() {
      window.location.href = href;
    }, 400);
  });
  
  // Handle back/forward cache
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      document.body.style.opacity = 1;
    }
  });

  // ══════════════════════════════════════════
  //  THEME TOGGLE
  // ══════════════════════════════════════════
  const savedTheme = localStorage.getItem('Azhagii-theme') || 'dark';
  $('body').attr('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  $('#themeToggle').click(function () {
    const current = $('body').attr('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    $('body').attr('data-theme', next);
    localStorage.setItem('Azhagii-theme', next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(theme) {
    $('#themeToggle i').attr('class', theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon');
  }

  // ══════════════════════════════════════════
  //  SIDEBAR MOBILE TOGGLE
  // ══════════════════════════════════════════
  $('#menu-toggle').click(function () {
    $('#sidebar').toggleClass('active');
    $('.sidebar-overlay').toggleClass('active');
  });
  $('.sidebar-overlay').click(function () {
    $('#sidebar').removeClass('active');
    $(this).removeClass('active');
  });

  // ══════════════════════════════════════════
  //  USER DROPDOWN
  // ══════════════════════════════════════════
  $('#userDropdownToggle').click(function (e) {
    e.stopPropagation();
    $(this).toggleClass('active');
    $('#userDropdownMenu').toggleClass('show');
  });

  $(document).click(function (e) {
    if (!$(e.target).closest('.user-dropdown-wrapper').length) {
      $('#userDropdownToggle').removeClass('active');
      $('#userDropdownMenu').removeClass('show');
    }
  });

  // ══════════════════════════════════════════
  //  HELPER: AJAX POST
  // ══════════════════════════════════════════
  function api(data, cb, errCb) {
    $.post('backend.php', data, function (res) {
      if (typeof res === 'string') try { res = JSON.parse(res); } catch (e) { }
      cb(res);
    }, 'json').fail(function (xhr) {
      console.error('API Error:', xhr);
      if (errCb) errCb(xhr);
      else {
        // Only show global error Swal if no SweetAlert modal is currently open
        // (avoids destroying open CRUD form modals)
        if (!Swal.isVisible()) {
          Swal.fire({ icon: 'error', title: 'Error', text: 'Connection failed. Please try again.' });
        }
      }
    });
  }



  // ══════════════════════════════════════════
  //  ROLE-SPECIFIC DASHBOARDS (REMOVED - Replaced by SSR in PHP files)
  // ══════════════════════════════════════════
  // Logic moved to adminDashboard.php, azhagiiDashboard.php, etc.

  function statCard(icon, label, value, color) {
    return `<div class="stat-card">
      <div class="stat-icon" style="background:${color}15;color:${color};"><i class="fas ${icon}"></i></div>
      <div><div class="stat-value">${value ?? 0}</div><div class="stat-label">${label}</div></div>
    </div>`;
  }



  // ══════════════════════════════════════════
  //  UTILITIES
  // ══════════════════════════════════════════
  function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function roleLabel(role) {
    const map = { 
      superAdmin: 'Super Admin', 
      adminAzhagii: 'Admin', 
      azhagiiCoordinator: 'Coordinator', 
      azhagiiStudents: 'Student' 
    };
    return map[role] || role;
  }

  function formatDate(d) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  function toast(icon, msg) {
    Swal.fire({ icon, title: msg, toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
  }

  // ══════════════════════════════════════════
  //  DATATABLE HELPER — init with export buttons
  // ══════════════════════════════════════════
  /**
   * Initialize or reinitialize a DataTable with Excel, PDF, CSV export buttons.
   * @param {string} tableId - The table element ID (e.g. 'collegesTable')
   * @param {string} exportTitle - Title for exported files (e.g. 'Colleges List')
   * @param {object} opts - Optional overrides: { ordering, paging, searching, columnDefs, ... }
   */
  function initDataTable(tableId, exportTitle, opts) {
    const $table = $('#' + tableId);
    if (!$table.length) return;

    // Destroy existing DataTable instance if any
    if ($.fn.DataTable.isDataTable($table)) {
      $table.DataTable().destroy();
    }

    // Detect last column index (for excluding Actions column from export)
    const colCount = $table.find('thead th').length;
    const lastColIdx = colCount - 1;

    // Check if last column header is "Actions"
    const lastHeader = $table.find('thead th').last().text().trim().toLowerCase();
    const hasActions = lastHeader === 'actions';

    // Build export column range (exclude Actions and # columns)
    const exportCols = [];
    for (let i = 0; i < colCount; i++) {
      const hdrText = $table.find('thead th').eq(i).text().trim().toLowerCase();
      if (hdrText !== 'actions' && hdrText !== 'photo') {
        exportCols.push(i);
      }
    }

    // Default config
    const config = {
      destroy: true,
      paging: true,
      searching: true,
      ordering: true,
      info: true,
      pageLength: 10,
      lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
      language: {
        search: '<i class="fas fa-search"></i>',
        searchPlaceholder: 'Search...',
        lengthMenu: 'Show _MENU_ entries',
        info: 'Showing _START_ to _END_ of _TOTAL_ entries',
        infoEmpty: 'No entries found',
        infoFiltered: '(filtered from _MAX_ total)',
        emptyTable: 'No data available',
        paginate: {
          first: '<i class="fas fa-angle-double-left"></i>',
          previous: '<i class="fas fa-chevron-left"></i>',
          next: '<i class="fas fa-chevron-right"></i>',
          last: '<i class="fas fa-angle-double-right"></i>'
        }
      },
      dom: '<"dt-top-bar"<"dt-top-left"lB><"dt-top-right"f>>rtip',
      buttons: [
        {
          extend: 'excelHtml5',
          text: '<i class="fas fa-file-excel dt-btn-icon"></i> Excel',
          title: exportTitle || 'Export',
          exportOptions: { columns: exportCols, format: { body: function(data, row, column, node) { return $(node).text().trim(); } } },
          className: 'dt-button-excel'
        },
        {
          extend: 'csvHtml5',
          text: '<i class="fas fa-file-csv dt-btn-icon"></i> CSV',
          title: exportTitle || 'Export',
          exportOptions: { columns: exportCols, format: { body: function(data, row, column, node) { return $(node).text().trim(); } } },
          className: 'dt-button-csv'
        },
        {
          extend: 'pdfHtml5',
          text: '<i class="fas fa-file-pdf dt-btn-icon"></i> PDF',
          title: exportTitle || 'Export',
          orientation: colCount > 6 ? 'landscape' : 'portrait',
          pageSize: 'A4',
          exportOptions: { columns: exportCols, format: { body: function(data, row, column, node) { return $(node).text().trim(); } } },
          className: 'dt-button-pdf'
        }
      ],
      columnDefs: hasActions ? [{ orderable: false, targets: lastColIdx }] : []
    };

    // Merge user overrides
    if (opts) {
      Object.assign(config, opts);
    }

    $table.DataTable(config);
  }


  // All pages are now SSR + Local Scripts. 
  // This router is kept empty for future global logic if needed.
  if (typeof CURRENT_PAGE !== 'undefined') {
    switch (CURRENT_PAGE) {
       // Cases handled locally in PHP files
    }
  }

});
