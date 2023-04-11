select *,
  -- the name of 'customer_id' used to be 'id', and it was a text field for some reason
  cast(customer_id as {{ dbt.type_string() }}) as id

from {{ ref('dim_customers') }}
