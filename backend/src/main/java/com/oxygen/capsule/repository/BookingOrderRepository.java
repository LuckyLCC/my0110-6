package com.oxygen.capsule.repository;

import com.oxygen.capsule.entity.BookingOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingOrderRepository extends JpaRepository<BookingOrder, Long> {
    List<BookingOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<BookingOrder> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
    BookingOrder findByOrderNo(String orderNo);
}