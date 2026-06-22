import React,
{
  useState
}
from "react";

import {
  findPartnerByEmail
}
from "../data/partnerRepository";

interface Props {
  onSuccess: () => void;
  onBack: () => void;
}

export default function PartnerLogin({
  onSuccess,
  onBack
}: Props) {

  const [email,
    setEmail] =
    useState("");

  async function
  handleLogin() {

    const partner =
      await findPartnerByEmail(
        email
      );

    if (!partner) {

      alert(
        "Partner not found"
      );

      return;
    }

    localStorage.setItem(
      "partnerProfile",
      JSON.stringify(partner)
    );

    localStorage.setItem(
      "partner_id",
      partner.partner_id
    );

    localStorage.setItem(
      "userRole",
      "partner"
    );

    onSuccess();
  }

  return (
    <div>
      <button
        onClick={onBack}
      >
        ← Back
      </button>

      <h1>
        Partner Login
      </h1>

      <input
        placeholder="Email ID"
        value={email}
        onChange={(e)=>
          setEmail(
            e.target.value
          )
        }
      />

      <button
        onClick={
          handleLogin
        }
      >
        Login
      </button>
    </div>
  );
}