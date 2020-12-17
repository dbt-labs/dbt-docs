{{ config(tags = ['important']) }}

select * from {{ ref('stg_customers') }}
