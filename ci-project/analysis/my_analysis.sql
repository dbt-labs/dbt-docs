

select

  customer_id,
  count(is_holiday) as number_of_holiday_orders

from {{ ref('stg_orders') }}
group by 1
