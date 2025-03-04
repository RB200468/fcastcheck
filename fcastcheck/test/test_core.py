import pytest, sys
from fcastcheck.core import main
from io import StringIO
from unittest.mock import patch


class Tests:

    # Command Line Argument Tests

    def test_usage_message_with_incorrect_args(self):
        with patch('sys.stdout', new_callable=StringIO) as mock_stdout, patch('sys.exit', side_effect=SystemExit) as mock_exit:
            sys.argv = ['timeseriesanalysispackage', 'run']
            with pytest.raises(SystemExit): 
                main()

            output = mock_stdout.getvalue().strip()
            assert output == "Usage: timeseriesanalysispackage run <user_script.py>"
            mock_exit.assert_called_once_with(1)

    def test_usage_message_with_invalid_run_argument(self):
        with patch('sys.stdout', new_callable=StringIO) as mock_stdout, patch('sys.exit', side_effect=SystemExit) as mock_exit:
            sys.argv = ['timeseriesanalysispackage', 'invalid_command', 'user_script.py']
            with pytest.raises(SystemExit): 
                main()

            output = mock_stdout.getvalue().strip()
            assert output == "Usage: timeseriesanalysispackage run <user_script.py>"
            mock_exit.assert_called_once_with(1)

    def test_correct_user_script_argument(self):
        with patch('sys.stdout', new_callable=StringIO) as mock_stdout:
            sys.argv = ['timeseriesanalysispackage', 'run', 'user_script.py']
            main()
            output = mock_stdout.getvalue().strip()
            assert output == 'user_script.py'
