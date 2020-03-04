

select count(*) from {{ ref('stg_orders') }}
