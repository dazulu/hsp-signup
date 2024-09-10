# HSP Course Booking Automation

This repository contains a Playwright script run as a manual Github action trigger to automate the process of booking sports courses at the Hochschulsport Hamburg website.

## How to use?

This repository includes a GitHub Actions workflow that can be triggered manually. To use it:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Sign up to HSP training" workflow
3. Choose either "hurling" or "football" from the dropdown menu
4. Click "Run workflow"

Note: Make sure to set up the `HSP_EMAIL` and `HSP_PASSWORD` secrets in your GitHub repository settings before running the workflow.

## License

[MIT](https://choosealicense.com/licenses/mit/)
