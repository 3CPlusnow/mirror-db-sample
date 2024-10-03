module.exports = {
    apps: [
      {
        name: 'broker',
        script: './src/index.js',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: false,
        out_file: './info.logs',
        error_file: './error.log',
      },
    ],
  };