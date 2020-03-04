
-- hack for DAG viz
-- {{ source('payments', 'orders') }}

select * from {{ ref('stg_orders') }}

