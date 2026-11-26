import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Departments = () => {
  const departmentArray = [
    { name: "Pediatrics", imageUrl: "/images/pedi.jpeg", desc: "Infant & Child Healthcare" },
    { name: "Orthopedics", imageUrl: "/images/orth.jpg", desc: "Bone, Joint & Spine Surgery" },
    { name: "Cardiology", imageUrl: "/images/card.jpg", desc: "Advanced Cardiovascular Care" },
    { name: "Neurology", imageUrl: "/images/neur.jpg", desc: "Brain & Nervous System Center" },
    { name: "Oncology", imageUrl: "/images/onc.jpg", desc: "Comprehensive Cancer Care" },
    { name: "Radiology", imageUrl: "/images/rad.jpg", desc: "Precision Medical Imaging & MRI" },
    { name: "Dermatology", imageUrl: "/images/dermat.jpg", desc: "Clinical Skin & Cosmetic Care" },
    { name: "ENT", imageUrl: "/images/entt.jpg", desc: "Ear, Nose & Throat Disorders" },
    { name: "Physical Therapy", imageUrl: "/images/ther.jpg", desc: "Rehabilitation & Mobility" },
  ];

  const responsive = {
    extraLarge: {
      breakpoint: { max: 3000, min: 1200 },
      items: 4,
      slidesToSlide: 1,
    },
    large: {
      breakpoint: { max: 1200, min: 900 },
      items: 3,
      slidesToSlide: 1,
    },
    medium: {
      breakpoint: { max: 900, min: 600 },
      items: 2,
      slidesToSlide: 1,
    },
    small: {
      breakpoint: { max: 600, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  return (
    <section className="departments-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Clinical Centers of Excellence</div>
          <h2 className="section-title">Specialized Medical Departments</h2>
          <p>Explore our multidisciplinary departments with dedicated outpatient clinics and live OPD token scheduling.</p>
        </div>

        <Carousel
          responsive={responsive}
          infinite={true}
          autoPlay={true}
          autoPlaySpeed={3500}
          transitionDuration={600}
          removeArrowOnDeviceType={["mobile"]}
          showDots={false}
        >
          {departmentArray.map((depart, index) => (
            <div className="department-card" key={index}>
              <img
                src={depart.imageUrl}
                alt={depart.name}
                className="department-img"
                onError={(e) => {
                  e.target.src = "/images/about.png";
                }}
              />
              <div className="department-content">
                <h4>{depart.name}</h4>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "14px" }}>
                  {depart.desc}
                </p>
                <Link
                  to="/appointment"
                  state={{ preselectedDepartment: depart.name }}
                  className="btn btn-outline"
                  style={{ width: "100%", fontSize: "13px", padding: "8px 12px" }}
                >
                  <span>Book In {depart.name}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default Departments;
