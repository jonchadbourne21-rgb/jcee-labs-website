PYTHON ?= python3

.PHONY: test test-postgres verify manifest

test:
	@if $(PYTHON) -c "import pytest" >/dev/null 2>&1; then \
		$(PYTHON) -m pytest tests/ -q; \
	else \
		echo "pytest unavailable: running unittest plus function runner"; \
		$(PYTHON) -m unittest discover -s tests -q; \
		$(PYTHON) tools/run_function_tests.py; \
	fi

test-postgres:
	@$(PYTHON) -c "import pgserver, psycopg" || \
		(echo "Install PostgreSQL test dependencies: pytest pgserver 'psycopg[binary]'"; exit 1)
	$(PYTHON) -m pytest \
		tests/test_pg_socket_loss.py \
		tests/test_postgres_journal.py::test_pg_live_cli_parity \
		-vv

verify: test
	$(PYTHON) verify_causal_delivery.py

manifest:
	$(PYTHON) verify_causal_delivery.py --write

